import React, { useEffect, useRef, useState } from "react"
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "react-query"
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles"
import {
  AppBar,
  Container,
  CssBaseline,
  Card,
  Toolbar,
  Typography,
  CardContent,
  CardActions,
  Button,
  Fab,
  makeStyles,
  TextField,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import CloseIcon from "@material-ui/icons/Close"
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers"
import DayjsUtils from "@date-io/dayjs"
import dayjs, {Dayjs} from 'dayjs'

import { deleteFood, getFoods } from "./gateway"
import { Food } from "./domain"

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#222",
    },
    secondary: {
      main: "#f50057",
    },
  },
})

const queryClient = new QueryClient()

function App() {
  return (
    <MuiPickersUtilsProvider utils={DayjsUtils}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Page />
        </ThemeProvider>
      </QueryClientProvider>
    </MuiPickersUtilsProvider>
  )
}

const useStyles = makeStyles(theme => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}))

function Page() {
  const styles = useStyles()
  const [newFoodOpen, setNewFoodOpen] = useState(true)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography component="p" variant="h6">
            FRDG
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        {newFoodOpen && <NewFoodForm />}
        <FoodList />
      </Container>
      <Fab
        className={styles.fab}
        color="primary"
        onClick={() => setNewFoodOpen(!newFoodOpen)}
      >
        {newFoodOpen ? <CloseIcon /> : <AddIcon />}
      </Fab>
    </>
  )
}

function NewFoodForm() {
  const [name, setName] = useState("")
  const [date, setDate] = useState<Dayjs | null>(dayjs())

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <form
        onSubmit={e => {
          e.preventDefault()
          console.log(name, date)
        }}
      >
        <CardContent>
          <TextField
            value={name}
            name="name"
            placeholder="Food Name"
            onChange={e => setName(e.target.value)}
          />
          <br/>
          <DatePicker
            name="date"
            value={date}
            onChange={newDate => {
              setDate(newDate)
            }}
          />
        </CardContent>
        <CardActions>
          <Button type="submit" size="small">
            Add
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

function FoodList() {
  const { isLoading, error, data } = useQuery(getFoods.name, getFoods)

  if (isLoading) {
    return <Loading />
  }

  if (error || !data) {
    return <>"Oops, something went wrong!"</>
  }

  return (
    <>
      {data.map(food => (
        <FoodItem key={food.id} {...food} />
      ))}
    </>
  )
}

function FoodItem({ name, bestBeforeDate, id }: Food) {
  const { mutateAsync: delFood } = useMutation(deleteFood, {
    onSuccess: () => {
      queryClient.invalidateQueries(getFoods.name)
    },
  })

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Best Before: {bestBeforeDate}
        </Typography>
        <Typography variant="h5" component="p">
          {name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => delFood(id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}

function Loading() {
  const timeoutRef = useRef<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current)
    }
  }, [])

  return <>{isVisible && "Loading..."}</>
}

export default App
