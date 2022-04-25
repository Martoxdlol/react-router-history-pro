import React from "react";
import HistoryPro from "history-pro";

import {
  HistoryProRouter,
  Link,
  useBlock,
  useBlocker,
  useHistory,
  useHistoryState,
  useLocation,
  Route,
  Routes,
  useHref,
  useInRouterContext,
  useMatch,
  useNavigate,
  useNavigationType,
  useOutlet,
  useParams,
  useResolvedPath,
  useSearchParams,
} from "react-router-history-pro";

declare global {
  interface Window {
    historyPro: any;
  }
}

if (!window.historyPro) {
  window.historyPro = new HistoryPro();
}

const historyPro = window.historyPro;

function HOME() {
  const navigate = useNavigate();
  const history = useHistory();
  return (
    <div>
      <h1>HOME</h1>
      <button onClick={() => navigate("1")}>Ir a /1</button>
      <button onClick={() => history.push("/x")}>Ir a /x</button>
      <p>State: {JSON.stringify(useHistoryState()[0])}</p>
    </div>
  );
}

function P1() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>1</h1>
      <button
        onClick={() => navigate("/2", { state: { a: 1 }, replace: true })}
      >
        Ir a /2
      </button>
      <Link to="/s">State X</Link>
    </div>
  );
}

function StateX() {
  const [text, setText] = useHistoryState("");
  console.log(text);
  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Link to="/1">NAVEGAR A 1</Link>
    </div>
  );
}

function P2() {
  // useHref, useInRouterContext, useLocation, useMatch, useNavigationType, useNavigate, useOutlet, useOutletContext, useParams, useResolvedPath, useRoutes
  const href = useHref("x");
  const routerContext = useInRouterContext();
  const location = useLocation();
  const match = useMatch("2");

  const block = useBlock();
  useBlocker((e, stopBlocking) => {
    console.log("Blocked ;)", e);
  });

  return (
    <div>
      <p>useHref('x'): {href}</p>
      <p>useInRouterContext(): {routerContext.toString()}</p>
      <p>useLocation(): {JSON.stringify(location)}</p>
      <p>useMatch('2'): {JSON.stringify(match)}</p>
      <p>useNavigationType(): {JSON.stringify(useNavigationType())}</p>
      <p>useOutlet(): {JSON.stringify(useOutlet())}</p>
      <p>useParams(): {JSON.stringify(useParams())}</p>
      <p>useResolvedPath(): {JSON.stringify(useResolvedPath("x"))}</p>
      <p>useSearchParams(): {JSON.stringify(useSearchParams())}</p>
      <Link to="/x/d">ir a: /x/d</Link>
      <Link to="/">ir a: /</Link>
      <a
        onClick={() => {
          block(
            (e, stopBlocking) => {
              console.log(e);
              alert("Oh, no. You can't escape.");
            },
            { blockPushPopAndReplace: true }
          );
        }}
      >
        Block
      </a>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <HistoryProRouter history={historyPro}>
        <Routes>
          <Route path="/" element={<HOME />} />
          <Route path="/1" element={<P1 />} />
          <Route path="/2" element={<P2 />} />
          <Route path="/s" element={<StateX />} />
          <Route path="/x">
            <Route index element={<P1 />} />
            <Route path="1" element={<P1 />} />
            <Route path=":x" element={<P2 />} />
          </Route>
        </Routes>
      </HistoryProRouter>
    </div>
  );
}

export default App;
