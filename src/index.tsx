import * as React from "react";
import {
    Navigate,
    Outlet,
    Route,
    Router,
    Routes,
    createRoutesFromChildren,
    generatePath,
    matchRoutes,
    matchPath,
    createPath,
    parsePath,
    resolvePath,
    renderMatches,
    useHref,
    useInRouterContext,
    useLocation,
    useMatch,
    useNavigate,
    useNavigationType,
    useOutlet,
    useParams,
    useResolvedPath,
    useRoutes,
    useOutletContext,
    NavigationType,
} from "react-router";
import type { To } from "react-router";
import createHistory, { ReactRouterNavigator } from "history-pro/react";
import HistoryPro, { BlockOptions, NavEvent, NavLocation } from "history-pro";

const __DEV__ = process.env.NODE_ENV === 'development'

function warning(cond: boolean, message: string): void {
    if (!cond) {
        // eslint-disable-next-line no-console
        if (typeof console !== "undefined") console.warn(message);

        try {
            // Welcome to debugging React Router!
            //
            // This error is thrown as a convenience so you can more easily
            // find the source for a warning that appears in the console by
            // enabling "pause on exceptions" in your JavaScript debugger.
            throw new Error(message);
            // eslint-disable-next-line no-empty
        } catch (e) { }
    }
}

////////////////////////////////////////////////////////////////////////////////
// RE-EXPORTS
////////////////////////////////////////////////////////////////////////////////

// Note: Keep in sync with react-router exports!
export {
    Navigate,
    Outlet,
    Route,
    Router,
    Routes,
    createRoutesFromChildren,
    generatePath,
    matchRoutes,
    matchPath,
    createPath,
    parsePath,
    renderMatches,
    resolvePath,
    useHref,
    useInRouterContext,
    useHistoryLocation as useNavLocation,
    useLocation,
    useMatch,
    useNavigate,
    useNavigationType,
    useOutlet,
    useParams,
    useResolvedPath,
    useRoutes,
    useOutletContext,
};

export { NavigationType } from "react-router";
export type {
    Hash,
    Location,
    Path,
    To,
    MemoryRouterProps,
    NavigateFunction,
    NavigateOptions,
    NavigateProps,
    Navigator,
    OutletProps,
    Params,
    PathMatch,
    RouteMatch,
    RouteObject,
    RouteProps,
    PathRouteProps,
    LayoutRouteProps,
    IndexRouteProps,
    RouterProps,
    Pathname,
    Search,
    RoutesProps,
} from "react-router";

///////////////////////////////////////////////////////////////////////////////
// DANGER! PLEASE READ ME!
// We provide these exports as an escape hatch in the event that you need any
// routing data that we don't provide an explicit API for. With that said, we
// want to cover your use case if we can, so if you feel the need to use these
// we want to hear from you. Let us know what you're building and we'll do our
// best to make sure we can support you!
//
// We consider these exports an implementation detail and do not guarantee
// against any breaking changes, regardless of the semver release. Use with
// extreme caution and only if you understand the consequences. Godspeed.
///////////////////////////////////////////////////////////////////////////////

/** @internal */
export {
    UNSAFE_NavigationContext,
    UNSAFE_LocationContext,
    UNSAFE_RouteContext,
} from "react-router";

////////////////////////////////////////////////////////////////////////////////
// COMPONENTS
////////////////////////////////////////////////////////////////////////////////

export interface HistoryRouterProps {
    basename?: string;
    children?: React.ReactNode;
    history: HistoryPro;
}

interface HistoryProRouterContext {
    history: HistoryPro
    location: NavLocation
    basename?: string
    event?: NavEvent
}

type HistoryProRouterState = {
    action: NavigationType
    location: NavLocation
    event?: NavEvent
}

const Context = React.createContext<HistoryProRouterContext>({} as HistoryProRouterContext);
export { Context as historyProRouterContext }

export function HistoryProRouter({ basename, children, history }: HistoryRouterProps) {
    const navigator: ReactRouterNavigator = React.useMemo(() => createHistory(history), [history])

    const [state, setState] = React.useState<HistoryProRouterState>({
        action: NavigationType.Pop,
        location: navigator.location,
    })

    React.useLayoutEffect(() => navigator.listen(setState), [navigator]);

    return (
        <Context.Provider value={{ history, event: state.event, basename, location: state.location }}>
            <Router
                basename={basename}
                children={children}
                location={state.location}
                navigationType={state.action}
                navigator={navigator}
            />
        </Context.Provider>
    );
}

/**
 * Returns the HistoryPro instance used by the router
 * it can be used to: push(), pop(), replace(), block(), listen(), and more!
 */
export function useHistory() {
    const value = React.useContext(Context)
    return value.history
}

/**
 * Returns last navigation event as NavEvent instance
 */
export function useHistoryEvent() {
    const value = React.useContext(Context)
    return value.event
}

export function useHistoryLocation() {
    const context = React.useContext(Context)
    return context.location
}

/**
 * Used to block navigation.
 * It can block ⬅➡ keys and, using options, push and pop actions.  
 * It returns a block() function. Then you use block(blocker_callback)
 */
export function useBlock() {
    const history = useHistory()
    return (blocker: (e: NavEvent, stopBlocking: () => void) => void, options?: BlockOptions): () => void => {
        const unblock = history?.block(blocker, options)
        if (unblock) return () => { unblock() }
        return () => { }
    }
}

/**
 * Used to block navigation.
 * It can block ⬅➡ keys and, using options, push and pop actions.  
 * It recives directly the blocker function.
 * By default, it will automatically unblock if pushed a new location. Also if component removed.
 * Ej: making appear a modal, you can useBlocker and if modal dissapear it will automatically stop blocking.
 */
export function useBlocker(blocker: (e: NavEvent, stopBlocking: () => void) => void, options?: BlockOptions) {
    const history = useHistory()
    React.useEffect(() => {
        const cancel = history?.block(blocker, options)
        return () => cancel!()
    }, [history, blocker])
}

/**
 * Listen all history events.
 * It can be used to cancel event with event.setCancelled(true) 
 */
export function useHistoryListener(listener: (e: NavEvent) => void) {
    const history = useHistory()
    React.useEffect(() => {
        const cancel = history?.listen(listener)
        return () => cancel!()
    }, [history, listener])
}

/**
 * It can be used only one time on a route. (Is the same history every time for each location)
 * Stores the state on history
 */
export function useHistoryState(initial?: any) {
    const location: NavLocation = useHistoryLocation() as NavLocation
    console.log(location)
    const state = location.state ?? initial
    const [stateState, setStateState] = React.useState(state)
    function setState(s: any) {
        location.state = s
        setStateState(s)
    }
    return [stateState, setState]
}

/**
 * Returns router basename
 */
export function useBasename() {
    const value = React.useContext(Context)
    return value.basename
}

if (__DEV__) {
    HistoryProRouter.displayName = "unstable_HistoryProRouter";
}

export { HistoryProRouter as unstable_HistoryRouter };

function isModifiedEvent(event: React.MouseEvent) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export interface LinkProps
    extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    reloadDocument?: boolean;
    replace?: boolean;
    state?: any;
    to: To;
}

/**
 * The public API for rendering a history-aware <a>.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
    function LinkWithRef(
        { onClick, reloadDocument, replace = false, state, target, to, ...rest },
        ref
    ) {
        let href = useHref(to);
        let internalOnClick = useLinkClickHandler(to, { replace, state, target });
        function handleClick(
            event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
        ) {
            if (onClick) onClick(event);
            if (!event.defaultPrevented && !reloadDocument) {
                internalOnClick(event);
            }
        }

        return (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a
                {...rest}
                href={href}
                onClick={handleClick}
                ref={ref}
                target={target}
            />
        );
    }
);

if (__DEV__) {
    Link.displayName = "Link";
}

export interface NavLinkProps
    extends Omit<LinkProps, "className" | "style" | "children"> {
    children?:
    | React.ReactNode
    | ((props: { isActive: boolean }) => React.ReactNode);
    caseSensitive?: boolean;
    className?: string | ((props: { isActive: boolean }) => string | undefined);
    end?: boolean;
    style?:
    | React.CSSProperties
    | ((props: { isActive: boolean }) => React.CSSProperties);
}

/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
    function NavLinkWithRef(
        {
            "aria-current": ariaCurrentProp = "page",
            caseSensitive = false,
            className: classNameProp = "",
            end = false,
            style: styleProp,
            to,
            children,
            ...rest
        },
        ref
    ) {
        let location = useLocation();
        let path = useResolvedPath(to);

        let locationPathname = location.pathname;
        let toPathname = path.pathname;
        if (!caseSensitive) {
            locationPathname = locationPathname.toLowerCase();
            toPathname = toPathname.toLowerCase();
        }

        let isActive =
            locationPathname === toPathname ||
            (!end &&
                locationPathname.startsWith(toPathname) &&
                locationPathname.charAt(toPathname.length) === "/");

        let ariaCurrent = isActive ? ariaCurrentProp : undefined;

        let className: string | undefined;
        if (typeof classNameProp === "function") {
            className = classNameProp({ isActive });
        } else {
            // If the className prop is not a function, we use a default `active`
            // class for <NavLink />s that are active. In v5 `active` was the default
            // value for `activeClassName`, but we are removing that API and can still
            // use the old default behavior for a cleaner upgrade path and keep the
            // simple styling rules working as they currently do.
            className = [classNameProp, isActive ? "active" : null]
                .filter(Boolean)
                .join(" ");
        }

        let style =
            typeof styleProp === "function" ? styleProp({ isActive }) : styleProp;

        return (
            <Link
                {...rest}
                aria-current={ariaCurrent}
                className={className}
                ref={ref}
                style={style}
                to={to}
            >
                {typeof children === "function" ? children({ isActive }) : children}
            </Link>
        );
    }
);

if (__DEV__) {
    NavLink.displayName = "NavLink";
}

////////////////////////////////////////////////////////////////////////////////
// HOOKS
////////////////////////////////////////////////////////////////////////////////

/**
 * Handles the click behavior for router `<Link>` components. This is useful if
 * you need to create custom `<Link>` components with the same click behavior we
 * use in our exported `<Link>`.
 */
export function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
    to: To,
    {
        target,
        replace: replaceProp,
        state,
    }: {
        target?: React.HTMLAttributeAnchorTarget;
        replace?: boolean;
        state?: any;
    } = {}
): (event: React.MouseEvent<E, MouseEvent>) => void {
    let navigate = useNavigate();
    let location = useLocation();
    let path = useResolvedPath(to);

    return React.useCallback(
        (event: React.MouseEvent<E, MouseEvent>) => {
            if (
                event.button === 0 && // Ignore everything but left clicks
                (!target || target === "_self") && // Let browser handle "target=_blank" etc.
                !isModifiedEvent(event) // Ignore clicks with modifier keys
            ) {
                event.preventDefault();

                // If the URL hasn't changed, a regular <a> will do a replace instead of
                // a push, so do the same here.
                let replace =
                    !!replaceProp || createPath(location) === createPath(path);

                navigate(to, { replace, state });
            }
        },
        [location, navigate, path, replaceProp, state, target, to]
    );
}

/**
 * A convenient wrapper for reading and writing search parameters via the
 * URLSearchParams interface.
 */
export function useSearchParams(defaultInit?: URLSearchParamsInit) {
    warning(
        typeof URLSearchParams !== "undefined",
        `You cannot use the \`useSearchParams\` hook in a browser that does not ` +
        `support the URLSearchParams API. If you need to support Internet ` +
        `Explorer 11, we recommend you load a polyfill such as ` +
        `https://github.com/ungap/url-search-params\n\n` +
        `If you're unsure how to load polyfills, we recommend you check out ` +
        `https://polyfill.io/v3/ which provides some recommendations about how ` +
        `to load polyfills only for users that need them, instead of for every ` +
        `user.`
    );

    let defaultSearchParamsRef = React.useRef(createSearchParams(defaultInit));

    let location = useLocation();
    let searchParams = React.useMemo(() => {
        let searchParams = createSearchParams(location.search);

        for (let key of defaultSearchParamsRef.current.keys()) {
            if (!searchParams.has(key)) {
                defaultSearchParamsRef.current.getAll(key).forEach((value) => {
                    searchParams.append(key, value);
                });
            }
        }

        return searchParams;
    }, [location.search]);

    let navigate = useNavigate();
    let setSearchParams = React.useCallback(
        (
            nextInit: URLSearchParamsInit,
            navigateOptions?: { replace?: boolean; state?: any }
        ) => {
            navigate("?" + createSearchParams(nextInit), navigateOptions);
        },
        [navigate]
    );

    return [searchParams, setSearchParams] as const;
}

export type ParamKeyValuePair = [string, string];

export type URLSearchParamsInit =
    | string
    | ParamKeyValuePair[]
    | Record<string, string | string[]>
    | URLSearchParams;

/**
 * Creates a URLSearchParams object using the given initializer.
 *
 * This is identical to `new URLSearchParams(init)` except it also
 * supports arrays as values in the object form of the initializer
 * instead of just strings. This is convenient when you need multiple
 * values for a given key, but don't want to use an array initializer.
 *
 * For example, instead of:
 *
 *   let searchParams = new URLSearchParams([
 *     ['sort', 'name'],
 *     ['sort', 'price']
 *   ]);
 *
 * you can do:
 *
 *   let searchParams = createSearchParams({
 *     sort: ['name', 'price']
 *   });
 */
export function createSearchParams(
    init: URLSearchParamsInit = ""
): URLSearchParams {
    return new URLSearchParams(
        typeof init === "string" ||
            Array.isArray(init) ||
            init instanceof URLSearchParams
            ? init
            : Object.keys(init).reduce((memo, key) => {
                let value = init[key];
                return memo.concat(
                    Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
                );
            }, [] as ParamKeyValuePair[])
    );
}