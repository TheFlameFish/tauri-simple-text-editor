import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  function Toolbar() {
    return (
      <div className="toolbar">
        <button>File</button>
        <button>Edit</button>
      </div>
    )
  }

  return (
    <main className="container">
      <Toolbar />
      <textarea className="editor" />
    </main>
  );
}

export default App;
