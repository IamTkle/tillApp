import {
  AppBar,
  Button,
  Container,
  Divider,
  Grid,
  Input,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useRef, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import QrReader from "react-qr-reader";

const useStyles = makeStyles({
  parentContainer: {
    textAlign: "center",
  },
});

const initializeRows = () => {
  let rowArray = [];

  for (let i = 0; i < 1000; i++) {
    rowArray.push({ id: i, pid: i, pname: "Cum sock type " + i });
  }

  return rowArray;
};

function App() {
  const classes = useStyles();

  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rows] = useState(() => initializeRows());

  const [columns] = useState([
    { field: "pid", headerName: "Product ID", width: 200 },
    { field: "pname", headerName: "Product Name", width: 200 },
  ]);

  const [jsonObj, setJsonObj] = useState({ uid: "", items: [] });

  const [objStr, setObjStr] = useState(JSON.stringify(jsonObj, null, 10));

  const [selectionModel, setSelectionModel] = useState([]);

  useEffect(() => {
    setObjStr(JSON.stringify(jsonObj, null, 10));
  }, [jsonObj]);

  useEffect(() => {
    setJsonObj((prev) => {
      return { ...prev, items: selectionModel.map((index) => rows[index]) };
    });
  }, [selectionModel, rows]);

  return (
    <div className="App">
      <AppBar>
        <Toolbar>
          <Typography variant="h5">Handy Pantry Till Demo App</Typography>
          <Button
            style={{ marginLeft: "auto" }}
            variant="contained"
            color={scanning ? "error" : "secondary"}
            onClick={() => {
              setScanning((prev) => !prev);
              setErrorMessage("");
            }}
          >
            {!scanning ? "Scan QR" : "Cancel"}
          </Button>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Grid container spacing={1} minHeight="32rem">
        <Grid item xs={6} minHeight="40rem">
          <DataGrid
            rows={rows}
            columns={columns}
            components={{
              Toolbar: GridToolbar,
            }}
            selectionModel={selectionModel}
            onSelectionModelChange={(model) => setSelectionModel(model)}
            checkboxSelection
          />
        </Grid>
        <Divider />
        {scanning && (
          <Grid item xs={5}>
            <Container maxWidth="xs" className={classes.parentContainer}>
              <Typography variant="h6">{errorMessage}</Typography>
              <QrReader
                delay={1000}
                style={{ width: "100%", aspectRatio: "1 / 1" }}
                onScan={(data) => {
                  console.log(data);
                  if (data) {
                    setScanning(false);
                    setErrorMessage(data);
                    setJsonObj((prev) => {
                      return { ...prev, uid: data };
                    });
                    return;
                  }
                  setErrorMessage(
                    "Please place your QR code in front of the camera"
                  );
                }}
                onError={(error) => {
                  console.error(error);
                }}
              />
            </Container>
          </Grid>
        )}
        <Grid item xs={scanning ? 12 : 5}>
          <TextField
            label="JSON object preview"
            value={objStr}
            multiline
            fullWidth
            maxRows={25}
          />
          <Button color="secondary" variant="contained" fullWidth>
            Send
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
