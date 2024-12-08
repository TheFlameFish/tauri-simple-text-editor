import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { save as saveDialog } from "@tauri-apps/plugin-dialog";
import { message as messageDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";
import "./App.css";
import { writeTextFile } from "@tauri-apps/plugin-fs";

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

function Toolbar({ openFile, saveFileAs }) {
  return (
    <div className="toolbar">
      <DropdownMenu
        label="File"
        buttons={[
          { label: "Open", onClick: openFile },
          { label: "Save As", onClick: saveFileAs },
        ]}
      />
      <DropdownMenu
        label="Edit"
        buttons={[{ label: "foo", onClick: () => null }]}
      />
    </div>
  );
}

function Footer({ sessionPath }) {
  const path = sessionPath ?? "No file open";

  return (
    <div className="footer">
      <p>{path}</p>
    </div>
  );
}

function Editor({ sessions, setSessions, activeSession }) {
  function handleChange(event) {
    const newContent = event.target.value;

    // Sync with global sessions state
    setSessions((prevSessions) => ({
      ...prevSessions,
      [activeSession]: {
        ...prevSessions[activeSession],
        content: newContent,
      },
    }));
  }

  return (
    <textarea
      className="editor"
      autoFocus
      value={sessions[activeSession]?.content || ""}
      onChange={e => setSessions((prevSessions) => ({
        ...prevSessions,
        [activeSession]: {
          ...prevSessions[activeSession],
          content: e.target.value
        }
      }))}
    />
  );
}

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

  async function saveFileAs() {
    const path = await saveDialog({});
    await writeTextFile(path, sessions[activeSession].content);

    sessions[activeSession].path = path;
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

  // Application
  return (
    <main className="container">
      <Toolbar openFile={openFile} saveFileAs={saveFileAs}/>
      <Editor sessions={sessions} setSessions={setSessions} activeSession={activeSession}/>
      <Footer sessionPath={sessions[activeSession].path}/>
    </main>
  );
}

export default App;
