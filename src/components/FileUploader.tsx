import React, { useRef, MouseEvent, ChangeEvent } from "react";

interface FileUploaderProps {
  onUpload: Function;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    if (hiddenFileInput) {
      hiddenFileInput.current?.click();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const fileUploaded = event.target.files[0];
      onUpload(fileUploaded);
    }
  };

  return (
    <>
      <button className="upload-button" onClick={handleClick}>
        Upload a file
      </button>
      <input
        type="file"
        style={{ display: "none" }}
        onChange={handleChange}
        ref={hiddenFileInput}
      />
    </>
  );
};

export default FileUploader;
