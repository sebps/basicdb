import React, { useCallback, useEffect, useRef, useState } from "react";

import { Stack, IStackStyles, MessageBar, MessageBarType } from "@fluentui/react";
import Editor, { useMonaco, BeforeMount, OnMount, OnValidate } from "@monaco-editor/react";
import dirtyJson from "dirty-json";
import { flatten, unflatten } from "flat";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

import { useToggle } from "../../hooks";
import { TitleBar } from "./components/title-bar";
import { ToolBar } from "./components/tool-bar";
import { BorderLine } from "./styles";
import {
  downloadJsonFile,
  minifyJsonString,
  prettifyJsonString,
  parseJsonSchemaString,
} from "./utils";

const stackStyles: IStackStyles = {
  root: {
    height: "inherit",
    borderTop: BorderLine,
    borderRight: BorderLine,
    borderBottom: BorderLine,
  },
};

interface JSONEditorProps {
  defaultValue?: string;
  schemaValue?: string;
  title?: string;
  path?: string;
  isSchemaSampleDataOn: boolean;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  success?: string;
  error?: string;
}

interface RefObject extends Monaco.editor.ICodeEditor {
  _domElement?: HTMLElement;
}

export const JSONEditor: React.FC<JSONEditorProps> = ({
  defaultValue,
  schemaValue,
  title,
  path = "",
  isSchemaSampleDataOn,
  onChange,
  onSave,
  success,
  error,
}): JSX.Element => {
  const monaco = useMonaco();
  const [isAutoPrettifyOn, toggleAutoPrettifyOn] = useToggle(false);
  const [isValidJson, setIsValidJson] = useState<boolean>(false);
  const [editorValue, setEditorValue] = useState<string>();
  const [editorDefaultValue, setEditorDefaultValue] = useState<string>();
  const editorRef = useRef<RefObject | null>(null);
  const [showSuccess, toggleShowSuccess] = useToggle(false);
  const [showError, toggleShowError] = useToggle(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  useEffect(() => {
    const prettyDefaultValue = defaultValue ? prettifyJsonString(defaultValue) : undefined;
    setEditorDefaultValue(prettyDefaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (success) {
      toggleShowSuccess();
    }
  }, [success, toggleShowSuccess]);

  useEffect(() => {
    if (error) {
      toggleShowError();
    }
  }, [error, toggleShowError]);

  const updateEditorLayout = useCallback(() => {
    // Type BUG: editor.IDimension.width & editor.IDimension.height should be "number"
    // but it needs to have "auto" otherwise layout can't be updated;
    // eslint-disable-next-line
    const editor: any = editorRef.current;
    if (!editor) return;
    // Initialize layout's width and height
    editor.layout({
      width: "auto",
      height: "auto",
    });
    // eslint-disable-next-line
    const editorEl = editor._domElement;
    if (!editorEl) return;
    const { width, height } = editorEl.getBoundingClientRect();
    // update responsive width and height
    editor.layout({
      width,
      height,
    });
  }, []);

  const handleJsonSchemasUpdate = useCallback(() => {
    monaco?.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: schemaValue
        ? [
            {
              uri: window.location.href, // id of the first schema
              fileMatch: ["*"], // associate with our model
              schema: {
                ...parseJsonSchemaString(schemaValue),
              },
            },
          ]
        : undefined,
    });
  }, [schemaValue, monaco]);

  const handleEditorPrettify = useCallback(() => {
    editorRef.current?.getAction("editor.action.formatDocument").run();
  }, []);

  const handleEditorUpdateValue = useCallback((value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.setValue(value || "");
    value && editor.getAction("editor.action.formatDocument").run();
  }, []);

  const handleClearClick = () => editorRef.current?.setValue("");

  const handleEditorWillMount: BeforeMount = () => handleJsonSchemasUpdate();

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.getModel()?.updateOptions({ tabSize: 2, insertSpaces: false });
    updateEditorLayout();

    window.addEventListener("resize", () => {
      // automaticLayout isn't working
      // https://github.com/suren-atoyan/monaco-react/issues/89#issuecomment-666581193
      // clear current layout
      updateEditorLayout();
    });

    // need to use formatted prettify json string
    defaultValue && handleEditorUpdateValue(prettifyJsonString(defaultValue));
  };

  useEffect(() => {
    handleEditorUpdateValue(defaultValue);
  }, [defaultValue, handleEditorUpdateValue]);

  useEffect(() => {
    handleJsonSchemasUpdate();
  }, [schemaValue, handleJsonSchemasUpdate]);

  useEffect(() => {
    updateEditorLayout();
  }, [isSchemaSampleDataOn, updateEditorLayout]);

  useEffect(() => {
    isAutoPrettifyOn && handleEditorPrettify();
  }, [isAutoPrettifyOn, handleEditorPrettify]);

  const handleEditorValidation: OnValidate = useCallback((markers) => {
    const errorMessage = markers.map(
      ({ startLineNumber, message }) => `line ${startLineNumber}: ${message}`
    );
    const hasContent = editorRef.current?.getValue();
    const hasError: boolean = errorMessage.length > 0;
    setIsValidJson(!!hasContent && !hasError);
  }, []);

  const handleMinifyClick = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const value = editor.getValue();
    const minifiedValue = minifyJsonString(value);
    editor.setValue(minifiedValue);
  };

  const handleUploadClick = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const result = fileReader.result as string;
      handleEditorUpdateValue(result);
    };
    fileReader.readAsText(file);
  };

  const handleDownloadClick = () => {
    const value = editorRef.current?.getValue();
    value && downloadJsonFile(value);
  };

  const handleSaveClick = () => {
    const value = editorRef.current?.getValue();
    value && onSave && onSave(value);
  };

  const handleSearch = (searchedValue: string | undefined) => {
    if (defaultValue === undefined) return;

    if (searchedValue !== undefined) {
      setIsReadOnly(true);

      const flattenedUnfilteredValue = flatten(JSON.parse(defaultValue));
      const flattenedFilteredValue = Object.entries(flattenedUnfilteredValue).reduce(
        (reduced, [key, value]) => {
          let toReduce: { [k: string]: any } = reduced;
          if (key.startsWith(searchedValue)) {
            toReduce = Object.assign(toReduce, { [key]: value });
          }
          return toReduce;
        },
        {}
      );
      const unflattenedFilteredValue = unflatten(flattenedFilteredValue);

      const prettyValue = unflattenedFilteredValue
        ? prettifyJsonString(JSON.stringify(unflattenedFilteredValue))
        : undefined;

      setEditorValue(prettyValue);
    } else {
      setIsReadOnly(false);
      const prettyValue = defaultValue ? prettifyJsonString(defaultValue) : undefined;
      setEditorValue(prettyValue);
    }
  };

  const handleClearSearch = () => {
    handleSearch(undefined);
  };

  const handleEditorChange = useCallback(
    (value) => {
      isAutoPrettifyOn && handleEditorPrettify();
      onChange && onChange(value);
    },
    [isAutoPrettifyOn, handleEditorPrettify, onChange]
  );

  const handleFixClick = () => {
    const editor = editorRef.current;
    const value = editor && editor.getValue();
    const fixedValue = value && dirtyJson.parse(value);
    const formattedValue = fixedValue && prettifyJsonString(JSON.stringify(fixedValue));
    editor && editor.setValue(formattedValue);
  };

  return (
    <Stack styles={stackStyles}>
      {title && (
        <Stack.Item>
          <TitleBar title={title} />
        </Stack.Item>
      )}
      <Stack.Item>
        <ToolBar
          isValidJson={isValidJson}
          isAutoPrettifyOn={isAutoPrettifyOn}
          onClear={handleClearSearch}
          onDownloadClick={handleDownloadClick}
          onSaveClick={handleSaveClick}
          onAutoPrettifyChange={toggleAutoPrettifyOn}
          onClearClick={handleClearClick}
          onMinifyClick={handleMinifyClick}
          onPrettifyClick={handleEditorPrettify}
          onUploadClick={handleUploadClick}
          onFixClick={handleFixClick}
          onSearch={handleSearch}
          isReadOnly={isReadOnly}
        />
      </Stack.Item>
      {showError && (
        <Stack.Item>
          <MessageBar onDismiss={() => toggleShowError()} messageBarType={MessageBarType.error}>
            {error}
          </MessageBar>
        </Stack.Item>
      )}
      {showSuccess && (
        <Stack.Item>
          <MessageBar onDismiss={() => toggleShowSuccess()} messageBarType={MessageBarType.success}>
            {success}
          </MessageBar>
        </Stack.Item>
      )}
      <Stack styles={stackStyles}>
        <Stack.Item
          grow
          align="stretch"
          style={{
            height: `calc(100% - 20vh)`,
          }}
        >
          <Editor
            language="json"
            path={path}
            options={{
              automaticLayout: true,
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
            }}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            beforeMount={handleEditorWillMount}
            onValidate={handleEditorValidation}
            defaultValue={editorDefaultValue}
            value={editorValue}
          />
        </Stack.Item>
      </Stack>
    </Stack>
  );
};
