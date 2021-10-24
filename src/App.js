import {
  Alert,
  AppBar,
  Button,
  CircularProgress,
  Container,
  Dialog,
  Divider,
  Grid,
  LinearProgress,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid/dist";
import { useCallback, useEffect, useState } from "react";
import QrReader from "react-qr-reader";

const useStyles = makeStyles({
  parentContainer: {
    textAlign: "center",
  },
  loginContainer: {
    marginLeft: "auto",
  },
});

// const initializeRows = () => {
//   let rowArray = [];

//   for (let i = 0; i < 1000; i++) {
//     rowArray.push({
//       id: i,
//       productID: i,
//       pname: "Cum sock type " + i,
//       exp: new Date(),
//       count: 1,
//     });
//   }

//   return rowArray;
// };

const DOMAIN = "https://pantties.azurewebsites.net";

function App() {
  const classes = useStyles();

  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rows, setRows] = useState([]);

  const [columns, setColumns] = useState([]);

  const [jsonObj, setJsonObj] = useState({ items: [], accountId: "" });

  const [objStr, setObjStr] = useState(JSON.stringify(jsonObj, null, 10));

  const [selectionModel, setSelectionModel] = useState([]);

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);

  const [loadProgress, setLoadProgress] = useState(0);

  const [isLogging, setIsLogging] = useState(false);

  const [editRowsModel, setEditRowsModel] = useState({});

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [snackbarMsg, setSnackbarMsg] = useState("Success!");

  const [alertSeverity, setAlertSeverity] = useState("success");

  useEffect(() => {
    setObjStr(JSON.stringify(jsonObj, null, 10));
  }, [jsonObj]);

  useEffect(() => {
    setJsonObj((prev) => {
      return {
        ...prev,
        items: selectionModel.map((index) => {
          const obj = rows[index];
          return {
            productID: obj.itemId,
            exp: obj.exp,
            count: obj.count,
            NotificationTime: obj.NotificationTime,
          };
        }),
      };
    });
  }, [selectionModel, rows]);

  useEffect(() => {
    const model = editRowsModel;

    if (model && Object.keys(model).length > 0) {
      const rowIndex = Object.keys(model)[0];

      // console.log(model, rowIndex);
      setRows((prev) => {
        let newRows = [...prev];
        let newRow = { ...prev[rowIndex] };
        // let newRow = {
        //   id: oldRow.id,
        //   productID: oldRow.productID,
        //   pname: oldRow.pname,
        //   count: oldRow.count,
        //   exp: oldRow.exp,
        // };

        console.log(newRow.count, newRow.exp);
        if (newRow.count !== undefined && model[rowIndex].count) {
          newRow.count = model[rowIndex].count.value;
        }
        if (newRow.exp && model[rowIndex].exp)
          newRow.exp = model[rowIndex].exp.value;

        newRows[rowIndex] = newRow;
        return [...newRows];
      });
    }
  }, [editRowsModel]);

  const checkLoggedIn = () => {
    fetch(DOMAIN + "/api/isLoggedIn", {
      method: "GET",
      credentials: "include",
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.isLoggedIn) {
          setLoggedIn(true);

          setSnackbarOpen(true);
          setSnackbarMsg("Welcome back!");
          setAlertSeverity("success");
        }
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    checkLoggedIn();

    fetch(DOMAIN + "/api/getShoppingProducts", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data[0]);
        setColumns(() => {
          let fields = Object.keys(data[0]).map((key, i) => {
            if (typeof data[0][key] === "object") return {};
            return {
              field: key,
              headerName: key,
              width: 200,
            };
          });
          fields.push({
            field: "exp",
            headerName: "Expiry Date",
            width: 100,
            editable: true,
            type: "date",
          });
          fields.push({
            field: "count",
            headerName: "Count",
            width: 100,
            editable: true,
            type: "number",
          });
          fields.push({
            field: "NotificationTime",
            headerName: "NotificationTime",
            width: 100,
            type: "date",
          });
          return fields;
        });

        setRows(
          data.map((item, i) => {
            return {
              ...item,
              id: i,
              exp: new Date().toISOString(),
              count: 1,
              NotificationTime: new Date().toISOString(),
            };
          })
        );
      })
      .catch((e) => console.error(e));
  }, []);

  const handleModelSelectionChange = (model) => {
    setSelectionModel(model);
  };

  const handleEditRowsModelChange = useCallback((model) => {
    setEditRowsModel(model);
  }, []);

  const handleLogin = async () => {
    const params = {
      method: loggedIn ? "GET" : "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: !loggedIn
        ? JSON.stringify({ email: username, password: password })
        : null,
    };

    if (!loggedIn) {
      setIsLogging(true);
      setLoadProgress(33);
      const resp = await fetch(DOMAIN + "/api/Users/Login", params).catch((e) =>
        console.error(e)
      );

      if (resp) {
        if (resp.ok || resp.status === 401) {
          document.cookie = "LoggedIn=value;path=/;" + document.cookie;
          setSnackbarOpen(true);
          setSnackbarMsg("Logged in successfully!");
          setAlertSeverity("success");
          setLoggedIn(true);
          setLoadProgress(100);
        } else {
          setAlertSeverity("error");
          setSnackbarMsg("Could not log in!");
          setSnackbarOpen(true);
          setLoggedIn(false);
          setLoadProgress(100);
        }
      } else {
        setAlertSeverity("error");
        setSnackbarMsg("Could not log in!");
        setSnackbarOpen(true);
        setLoggedIn(false);
        setLoadProgress(100);
      }
      setIsLogging(false);
    } else {
      setIsLogging(true);
      setLoadProgress(33);
      const resp = await fetch(DOMAIN + "/api/Users/Logout", params);

      setLoadProgress(100);
      if (resp.ok) {
        setLoggedIn(false);
        setSnackbarOpen(true);
        setSnackbarMsg("Logged out successfully!");
        setAlertSeverity("success");
        document.cookie =
          "LoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } else {
        setSnackbarOpen(true);
        setSnackbarMsg("Could not log out!");
        setAlertSeverity("error");
      }
      setIsLogging(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  const handleQRSend = async () => {
    setLoadProgress(33);
    const resp = await fetch(DOMAIN + "/api/QRProducts", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonObj),
    }).catch((e) => console.error(e));

    if (resp && resp.ok) {
      setAlertSeverity("success");
      setSnackbarMsg("Added items successfully!");
      setSnackbarOpen(true);
    } else if (resp && resp.status === 401) {
      setAlertSeverity("error");
      setSnackbarMsg("Not authorized to add items!");
      setSnackbarOpen(true);
    } else {
      setAlertSeverity("error");
      setSnackbarMsg("Could not add items!");
      setSnackbarOpen(true);
    }
    setLoadProgress(100);
  };

  return (
    <div className="App">
      <AppBar>
        <Toolbar>
          <Typography variant="h5">Handy Pantry Till Demo App</Typography>
          <div
            style={{
              marginInline: "auto",
            }}
          >
            <TextField
              disabled={loggedIn}
              variant="standard"
              value={username}
              style={{ marginInline: "2rem" }}
              onChange={(e) => setUsername(e.target.value)}
              type="email"
            />
            <TextField
              disabled={loggedIn}
              variant="standard"
              value={password}
              style={{ marginInline: "2rem" }}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              style={{ marginInline: "2rem" }}
              onClick={handleLogin}
              color={loggedIn ? "error" : "secondary"}
              endIcon={
                isLogging && (
                  <CircularProgress
                    color="warning"
                    variant="indeterminate"
                    size={24}
                  />
                )
              }
              variant="contained"
            >
              {loggedIn ? "Logout" : "Login"}
            </Button>
          </div>

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

        <LinearProgress variant="determinate" value={loadProgress} />
      </AppBar>
      <Toolbar />
      <Grid container spacing={1} minHeight="32rem">
        <Grid item xs={12} minHeight="40rem">
          <DataGrid
            rows={rows}
            columns={columns}
            components={{
              Toolbar: GridToolbar,
            }}
            editRowsModel={editRowsModel}
            onEditRowsModelChange={handleEditRowsModelChange}
            selectionModel={selectionModel}
            onSelectionModelChange={handleModelSelectionChange}
            checkboxSelection
            disableSelectionOnClick
          />
        </Grid>
        <Divider />
        <Grid item xs={12}>
          <TextField
            label="JSON object preview"
            autoCorrect={false}
            spellCheck={false}
            value={objStr}
            multiline
            fullWidth
            maxRows={25}
            minRows={25}
          />
          <Button
            color="secondary"
            variant="contained"
            disabled={!loggedIn}
            fullWidth
            onClick={handleQRSend}
          >
            Send
          </Button>
        </Grid>
      </Grid>

      <Dialog
        open={scanning}
        onClose={() => {
          setScanning(false);
        }}
      >
        <Container maxWidth="xs" className={classes.parentContainer}>
          <Typography variant="h6">{errorMessage}</Typography>
          <QrReader
            delay={1000}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
            }}
            onScan={(data) => {
              console.log(data);
              if (data) {
                setScanning(false);
                setErrorMessage(data);
                setJsonObj((prev) => {
                  return { ...prev, accountId: data };
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
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={2500}
      >
        <Alert severity={alertSeverity}>{snackbarMsg}</Alert>
      </Snackbar>
    </div>
  );
}

export default App;
