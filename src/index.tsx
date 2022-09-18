import ReactDOM from "react-dom";
import { useEffect, useState, useRef } from "react";
import * as esbuild from "esbuild-wasm";
const App = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const ref = useRef<any>();

  useEffect(() => {
    startService();
  }, []);
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "/esbuild.wasm",
    });
  };

  const onClick = async () => {
    if (!ref.current) {
      return;
    }
    const result = await ref.current.transform(input, {
      loader: "jsx",
      target: "es2015",
    });

    setCode(result.code);
  };
  return (
    <div>
      <textarea
        onChange={(e) => setInput(e.target.value)}
        value={input}
      ></textarea>
      <div>
        <button onClick={onClick}>submit</button>
      </div>
      <pre>{code} </pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
