import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  /**
   * DropdownMenu component renders a dropdown menu with a label and a list of buttons.
   *
   * @param {Object} props - The properties object.
   * @param {string} props.label - The label for the dropdown menu.
   * @param {Array} props.buttons - The array of button objects to be displayed in the dropdown.
   * @param {string} props.buttons[].label - The label for each button.
   * @param {function} props.buttons[].onClick - The onClick handler for each button.
   *
   * @returns {JSX.Element} The rendered DropdownMenu component.
   */
  function DropdownMenu({ label, buttons }) {
    const [isOpen, setOpen] = useState(false);

    function handleClick() {
      setOpen(!isOpen);
    }

    function handleBlur(event) {
      // Check if the next focused element is inside the dropdown
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
      }
    }

    return (
      <div className="dropdown_menu" onBlur={handleBlur} tabIndex={0}>
        <button className="dropdown_label" onClick={handleClick}>
          {label}
        </button>
        {isOpen && <div className="dropdown_content">
          {buttons.map((button, index) => (
            <button key={index} onClick={() => {button.onClick(); setOpen(false)}}>
              {button.label}
            </button>
          ))}
        </div>}
      </div>
    )
  }

  function Toolbar() {
    return (
      <div className="toolbar">
        <DropdownMenu label="File" buttons={[
          {label: "Open", onClick: () => console.log("Open clicked")},
          {label: "Save", onClick: () => console.log("Save clicked")}
        ]} />
        <DropdownMenu label="Edit" buttons={[
          {label: "foo", onClick: () => {return null}}
        ]} />
      </div>
    )
  }

  function Footer() {
    return (
      <div className="footer">

      </div>
    )
  }

  return (
    <main className="container">
      <Toolbar />
      <textarea className="editor" />
      <Footer />
    </main>
  );
}

export default App;
