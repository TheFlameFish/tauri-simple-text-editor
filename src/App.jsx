import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  function DropdownMenu({ children }) {
    const [isOpen, setOpen] = useState(false);

    function handleClick() {
      setOpen(!isOpen);
    }

    return (
      <div className="dropdown_menu" onBlur={() => {setOpen(false)}}>
        <button className="dropdown_label" onClick={handleClick}>
          {children}
        </button>
        {isOpen && <div className="dropdown_content">
          <button>Open</button>
          <button>Save</button>
        </div>}
      </div>
    )
  }

  function Toolbar() {
    return (
      <div className="toolbar">
        <DropdownMenu>File</DropdownMenu>
        <DropdownMenu>Edit</DropdownMenu>
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
