import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { message as messageDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";
import "./App.css";

function App() {
  /* GENERAL FUNCTIONS & SUCH */
  const [sessions, setSessions] = useState({
    0: {
      path: null,
      content: "",
    },
  });
  const [activeSession, setActiveSession] = useState(0);

  async function openFile() {
    console.log(
      "Pre loading file. Sessions:\n",
      JSON.stringify(sessions),
      "\nActive session: ",
      activeSession
    );

    const file = await openDialog({
      multiple: false,
      directory: false,
    });
    loadFile(file);
  }

  async function loadFile(filePath) {
    // Check if the file's open already and also get the highest key.
    let highestKey = 0;
    let existingSessionKey = null;

    for (const [key, session] of Object.entries(sessions)) {
      if (parseInt(key) > highestKey) highestKey = parseInt(key);
      if (session.path === filePath) {
        existingSessionKey = parseInt(key);
      }
    }

    if (existingSessionKey !== null) {
      setActiveSession(existingSessionKey);
      return;
    }

    let content = "";
    try {
      content = await readTextFile(filePath);
    } catch (error) {
      await messageDialog("The file could not be read. Is it plain text?", {
        title: "Couldn't read file",
        kind: "error",
      });
      return;
    }

    setSessions((prevSessions) => ({
      ...prevSessions,
      [highestKey + 1]: {
        path: filePath,
        content,
      },
    }));
    setActiveSession(highestKey + 1);

    console.log(
      "File was maybe loaded? Sessions:\n",
      JSON.stringify(sessions),
      "\nActive session: ",
      activeSession
    );
  }

  /* COMPONENTS */

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
        {isOpen && (
          <div className="dropdown_content">
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={() => {
                  button.onClick();
                  setOpen(false);
                }}
              >
                {button.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function Toolbar() {
    return (
      <div className="toolbar">
        <DropdownMenu
          label="File"
          buttons={[
            { label: "Open", onClick: openFile },
            { label: "Save", onClick: () => console.log("Save clicked") },
          ]}
        />
        <DropdownMenu
          label="Edit"
          buttons={[{ label: "foo", onClick: () => null }]}
        />
      </div>
    );
  }

  function Footer() {
    return (
      <div className="footer">
        <p>No file open</p>
      </div>
    );
  }

  function Editor() {
    const [content, setContent] = useState(
      sessions[activeSession]?.content || ""
    );

    function handleChange(event) {
      const newContent = event.target.value;
      // setContent(newContent);

      // Sync with global sessions state
      setSessions((prevSessions) => ({
        ...prevSessions,
        [activeSession]: {
          ...prevSessions[activeSession],
          content: newContent,
        },
      }));
      console.log(newContent);
    }

    // Sync when activeSession or sessions change
    // useEffect(() => {
    //   if (content != sessions[activeSession]?.content || "") {
    //     console.log(content, " != ", sessions[activeSession]?.content || "")
    //     setContent(sessions[activeSession]?.content || "");
    //   } else {
    //     console.log(content, " == ", sessions[activeSession]?.content || "")
    //   }
    //   console.log("Responded to activeSession change.");
    // }, [activeSession, sessions]);

    return (
      <textarea
        className="editor"
        autoFocus
        value={sessions[activeSession]?.content || ""}
        onChange={handleChange}
      />
    );
  }

  // Application
  return (
    <main className="container">
      <Toolbar />
      <Editor />
      <Footer />
    </main>
  );
}

export default App;
