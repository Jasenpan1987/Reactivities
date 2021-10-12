import React, { useEffect, useState } from "react";
import { Button, Grid, Header } from "semantic-ui-react";
import PhotoWidgetCropper from "./PhotoWidgetCropper";
import PhotoWidgetDropzone from "./PhotoWidgetDropzone";

interface IProps {
  loading: boolean;
  uploadPhoto: (file: Blob) => void;
}

export default function PhotoUploadWidget({ loading, uploadPhoto }: IProps) {
  const [files, setFiles] = useState([] as any);
  const [cropper, setCropper] = useState<Cropper>();

  const onCrop = () => {
    if (cropper) {
      cropper.getCroppedCanvas().toBlob((blob) => {
        if (blob) {
          uploadPhoto(blob);
        }
      });
    }
  };

  useEffect(() => {
    return () => {
      files.forEach((file: any) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <Grid>
      <Grid.Column width="4">
        <Header sub color="teal" content="Step 1 - Add Photo" />
        <PhotoWidgetDropzone setFiles={setFiles} />
      </Grid.Column>
      <Grid.Column width="1" />
      <Grid.Column width="4">
        <Header sub color="teal" content="Step 2 - Resize Image" />
        {files && files.length > 0 && (
          <PhotoWidgetCropper
            setCropper={setCropper}
            imagePreview={files[0].preview}
          />
        )}
      </Grid.Column>
      <Grid.Column width="1" />
      <Grid.Column width="4">
        <Header sub color="teal" content="Step 3 - Preview And Upload" />
        <>
          <div
            className="img-preview"
            style={{ overflow: "hidden", minHeight: 200 }}
          />
          {files && files.length > 0 && (
            <Button.Group widths="2">
              <Button
                onClick={onCrop}
                positive
                icon="check"
                loading={loading}
              />
              <Button
                onClick={() => setFiles([])}
                icon="close"
                disabled={loading}
              />
            </Button.Group>
          )}
        </>
      </Grid.Column>
    </Grid>
  );
}
