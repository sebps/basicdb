import React, { Fragment, useRef } from "react";

import {
  CommandBar,
  ICommandBarItemProps,
  CommandButton,
  IIconProps,
  Stack,
  SearchBox,
  Text,
} from "@fluentui/react";

const filterIcon: IIconProps = { iconName: "Filter" };

export interface ToolBarProps {
  onClear: () => void;
  onDownloadClick: () => void;
  onSaveClick: () => void;
  onSearch: (value: string) => void;
  onMinifyClick: () => void;
  onPrettifyClick: () => void;
  onClearClick: () => void;
  onAutoPrettifyChange: () => void;
  onUploadClick: (fileContent: File) => void;
  onFixClick: () => void;
  isAutoPrettifyOn: boolean;
  isValidJson: boolean;
  isReadOnly: boolean;
}

const containerStyles: React.CSSProperties = {
  margin: "0 15px",
};

const itemStyles: React.CSSProperties = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
};

interface FileUploaderProps {
  onFileHandle: (fileContent: File) => void;
}

// Need to fix: hover is not working
export const FileUploader: React.FC<FileUploaderProps> = ({ onFileHandle }) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
      inputFileRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileUploaded = e.target.files[0];
    onFileHandle(fileUploaded);
  };

  const uploadIcon: IIconProps = {
    iconName: "Upload",
  };

  return (
    <>
      <CommandButton iconProps={uploadIcon} text="Upload" onClick={handleUploadClick} />
      <input
        ref={inputFileRef}
        style={{ display: "none" }}
        onChange={handleChange}
        type="file"
        accept="application/json"
      />
    </>
  );
};

export const ToolBar: React.FC<ToolBarProps> = ({
  onClear,
  onDownloadClick,
  onSaveClick,
  onSearch,
  isValidJson,
  isReadOnly,
}) => {
  console.log("rendering tool bar ...");
  console.log("is read only : ");
  console.log(isReadOnly);

  const leftItems: ICommandBarItemProps[] = [
    {
      key: "download",
      text: "Download Database",
      ariaLabel: "Grid view",
      iconProps: { iconName: "Download" },
      onClick: onDownloadClick,
      disabled: !isValidJson,
    },
    {
      key: "save",
      text: "Save Changes",
      ariaLabel: "Grid view",
      iconProps: { iconName: "Save" },
      onClick: onSaveClick,
      disabled: !isValidJson || isReadOnly,
    },
  ];

  return (
    <Stack horizontal style={containerStyles}>
      <Stack.Item style={itemStyles}>
        <Text variant="xLarge" block>
          POCDB
        </Text>
      </Stack.Item>
      <Stack.Item style={itemStyles}>
        <CommandBar
          styles={{
            root: {
              alignItems: "center",
            },
          }}
          items={leftItems}
          ariaLabel="json content commands"
        />
      </Stack.Item>
      <Stack.Item style={itemStyles}>
        <SearchBox
          placeholder="Filter DB Key"
          iconProps={filterIcon}
          onClear={(ev) => {
            console.log(ev);
            onClear();
          }}
          onChange={(_, newValue: string | undefined) => {
            if (newValue !== undefined && newValue.length > 0) {
              onSearch(newValue);
            } else {
              onClear();
            }
          }}
          onSearch={(newValue: string | undefined) => {
            if (newValue !== undefined && newValue.length > 0) {
              onSearch(newValue);
            } else {
              onClear();
            }
          }}
        />
      </Stack.Item>
    </Stack>
  );
};
