import {
  Button,
  CircularProgress,
  Container,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useGeolocation } from "@uidotdev/usehooks";
import axios from "axios";
import { map } from "lodash";
import { nanoid } from "nanoid";
import { Children, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import swal from "sweetalert";

function App() {
  const { latitude, longitude } = useGeolocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    isLoading,
    data: { data = {} } = {},
    refetch,
  } = useQuery("saved-locations", () =>
    axios(process.env.REACT_APP_LAMBDA_URL)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await axios(process.env.REACT_APP_LAMBDA_URL, {
        method: "POST",
        data: {
          id: nanoid(),
          title: event.target.title.value,
          latitude,
          longitude,
        },
      });
      toast.success("Location Saved Successfully");
      event.target.reset();
      refetch();
    } catch (error) {
      toast.success("Some Error Occured");
      console.log("🚀 ~ file: App.js:53 ~ handleSubmit ~ error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover it!",
      icon: "warning",
      dangerMode: true,
      closeOnClickOutside: false,
      buttons: ["Cancel", { text: "Delete Location", closeModal: false }],
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios({
            url: process.env.REACT_APP_LAMBDA_URL,
            data: JSON.stringify({ id }),
            method: "DELETE",
          });
          toast.success("Location deleted successfully.");
          refetch();
        } catch (error) {
          toast.success("Error occured!.");
        } finally {
          swal.stopLoading();
          swal.close();
        }
      } else {
        swal.close();
      }
    });
  };

  const handleUpdate = async (title, item) => {
    try {
      await axios(process.env.REACT_APP_LAMBDA_URL, {
        method: "PUT",
        data: {
          ...item,
          title,
        },
      });
      toast.success("Updated Successfully");
      refetch();
    } catch (error) {
      toast.success("Some Error Occured");
      console.log("🚀 ~ file: App.js:53 ~ handleSubmit ~ error:", error);
    }
  };

  return (
    <Container sx={{ pb: 5 }}>
      <Typography variant="h4" align="center" my={2}>
        Location Marker// zaid
      </Typography>
      <Paper>
        <iframe
          title="asd"
          width="100%"
          height="500px"
          src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z%3D14&amp&output=embed`}
        ></iframe>
      </Paper>

      <Stack component="form" onSubmit={handleSubmit} spacing={5} mt={3}>
        <TextField
          required
          fullWidth
          name="title"
          label="Location Title"
          placeholder="Enter location title"
        />

        <Button
          type="submit"
          fullWidth
          startIcon={
            submitting ? (
              <CircularProgress color="inherit" size={16} thickness={6} />
            ) : null
          }
          variant="contained"
          color="primary"
          size="large"
          sx={{ fontWeight: "bolder" }}
        >
          {submitting ? "Saving..." : "Save"}
        </Button>
      </Stack>

      <Typography variant="h6" mt={4}>
        My Saved Locations
      </Typography>
      <table width="100%" cellPadding={10}>
        {isLoading
          ? Children.toArray(
              map([...new Array(5)], () => {
                return (
                  <Paper component="tbody" elevation={2}>
                    <tr>
                      <td>
                        <Skeleton variant="text" />
                      </td>
                      <td align="right">
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent={"end"}
                        >
                          <Skeleton
                            variant="rounded"
                            width={"80px"}
                            height="30px"
                          />
                          <Skeleton
                            variant="rounded"
                            width={"80px"}
                            height="30px"
                          />
                        </Stack>
                      </td>
                    </tr>
                  </Paper>
                );
              })
            )
          : Children.toArray(
              map(data?.Items, (item) => {
                return (
                  <Paper component="tbody" elevation={2}>
                    <tr>
                      <td>
                        <Typography>
                          <div
                            contentEditable
                            style={{ outline: 0 }}
                            onBlur={(event) =>
                              handleUpdate(event.target.innerText, item)
                            }
                          >
                            {item.title}
                          </div>
                        </Typography>
                      </td>
                      <td align="right">
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent={"end"}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => deleteProduct(item.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            LinkComponent={"a"}
                            href={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z%3D14&amp`}
                            target="_blank"
                          >
                            Navigate
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  </Paper>
                );
              })
            )}
      </table>
    </Container>
  );
}

export default App;
