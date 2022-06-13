import React, { useEffect, useState } from "react";

import { Stack, IStackStyles, mergeStyleSets } from "@fluentui/react";
import { addedDiff, updatedDiff, deletedDiff } from "deep-object-diff";

import { JSONEditor } from "./components/json-editor";
import { SampleData } from "./components/json-editor/mock-data";
import { useToggle } from "./hooks";
import { flattenObject } from "./Util";

enum Editor {
  Schema = "Schema",
  InputJson = "Input JSON",
}

// Mutating styles definition
const containerStyle = (): IStackStyles => {
  return {
    root: {
      height: "100vh",
    },
  };
};

const editorStackStyle: IStackStyles = {
  root: {
    height: "100%",
  },
};

export const getEditorClassNames = ({ isFullWidth }: { isFullWidth: boolean }): IStackStyles =>
  mergeStyleSets({
    root: [
      {
        width: "50%",
        height: "100%",
      },
      isFullWidth && {
        width: "100%",
        height: "100%",
      },
    ],
  });

const App = (): JSX.Element => {
  const [isSchemaEditorOn] = useToggle(false);
  const [isSchemaSampleDataOn, toggleSchemaSampleDataOn] = useToggle(false);
  const [schemaValue] = useState<string | undefined>(undefined);
  const [data, setData] = useState<string | undefined>(undefined);

  const refetch = () => {
    fetch("http://127.0.0.1:2222/_database")
      .then((response) => response.json())
      .then((remoteData) => {
        setData(JSON.stringify(remoteData.value));
      });
  };

  const persistPUT = (key: string, value: string) => {
    fetch(`http://127.0.0.1:2222/_database/${key.split(".").join("/")}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  };

  const persistDELETE = (key: string) => {
    fetch(`http://127.0.0.1:2222/_database/${key.split(".").join("/")}`, {
      method: "DELETE",
    });
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (!isSchemaEditorOn && isSchemaSampleDataOn) {
      toggleSchemaSampleDataOn();
    }
  }, [isSchemaEditorOn, isSchemaSampleDataOn, toggleSchemaSampleDataOn]);

  // const handleValueChange = (value: string) => {
  //   console.log("value changed");
  //   console.log(value);
  // };

  const handleSave = (lastData: string) => {
    const lastDataJSON = JSON.parse(lastData);
    const dataJSON = JSON.parse(data!);
    const lastAddedDiff = addedDiff(dataJSON, lastDataJSON);
    const flattenLastAddedDiff = flattenObject(lastAddedDiff);

    const lastDeletedDiff = deletedDiff(dataJSON, lastDataJSON);
    const flattenLastDeletedDiff = flattenObject(lastDeletedDiff);
    Object.keys(flattenLastDeletedDiff).forEach((key) => {
      persistDELETE(key);
    });

    Object.keys(flattenLastAddedDiff).forEach((key) => {
      const value = flattenLastAddedDiff[key];
      persistPUT(key, value);
    });

    const lastUpdatedDiff = updatedDiff(dataJSON, lastDataJSON);
    const flattenLastUpdatedDiff = flattenObject(lastUpdatedDiff);
    Object.keys(flattenLastUpdatedDiff).forEach((key) => {
      const value = flattenLastAddedDiff[key];
      persistPUT(key, value);
    });
  };

  const getSchemaValue = () =>
    isSchemaSampleDataOn && !schemaValue ? SampleData.schema : schemaValue;

  return (
    <Stack styles={containerStyle}>
      <Stack wrap horizontal grow styles={editorStackStyle}>
        <Stack.Item
          styles={getEditorClassNames({
            isFullWidth: !isSchemaEditorOn,
          })}
        >
          <JSONEditor
            title={isSchemaEditorOn ? Editor.InputJson : ""}
            path="input_json.json"
            schemaValue={getSchemaValue()}
            isSchemaSampleDataOn={isSchemaSampleDataOn}
            defaultValue={data}
            // defaultValue={isSchemaSampleDataOn ? SampleData.jsonInput : undefined}
            // onChange={handleValueChange}
            onSave={handleSave}
          />
        </Stack.Item>
      </Stack>
    </Stack>
  );
};

const AppContainer = (): JSX.Element => <App />;

export default AppContainer;
