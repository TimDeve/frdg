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
import dayjs, { Dayjs } from "dayjs"
import duration from "dayjs/plugin/duration"
import localizedFormat from "dayjs/plugin/localizedFormat"

import * as gateway from "./gateway"
import { Food } from "./domain"

dayjs.extend(localizedFormat)
dayjs.extend(duration)

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
  foodItemAlert: ({ date }: { date?: Dayjs }) => {
    if (!date) {
      return { color: theme.palette.text.secondary }
    }

    const daysBeforeBBD = dayjs.duration(dayjs().diff(date)).days()

    if (daysBeforeBBD <= -1) {
      return { color: theme.palette.text.secondary }
    } else if (daysBeforeBBD <= 0) {
      return { color: theme.palette.warning.main }
    } else {
      return { color: theme.palette.error.main }
    }
  },
}))

function Page() {
  const styles = useStyles({})
  const [newFoodOpen, setNewFoodOpen] = useState(false)

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
        {newFoodOpen && <NewFoodForm onSuccess={() => setNewFoodOpen(false)} />}
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

interface NewFoodFormProps {
  onSuccess: () => void
}
function NewFoodForm({ onSuccess }: NewFoodFormProps) {
  const { mutateAsync: createFood } = useMutation(gateway.createFood, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getFoods.name)
      onSuccess()
    },
  })
  const [name, setName] = useState("")
  const [date, setDate] = useState<Dayjs | null>(dayjs())

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <form
        onSubmit={e => {
          e.preventDefault()
          if (name && date) {
            createFood({
              name,
              bestBeforeDate: date,
            })
          }
        }}
      >
        <CardContent>
          <TextField
            value={name}
            name="name"
            placeholder="Food Name"
            onChange={e => setName(e.target.value)}
          />
          <br />
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
  const { isLoading, error, data } = useQuery(
    gateway.getFoods.name,
    gateway.getFoods
  )

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
  const styles = useStyles({ date: bestBeforeDate })
  const { mutateAsync: deleteFood } = useMutation(gateway.deleteFood, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getFoods.name)
    },
  })

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <CardContent>
        <Typography className={styles.foodItemAlert} gutterBottom>
          Best Before: {bestBeforeDate.format("ll")}
        </Typography>
        <Typography variant="h5" component="p">
          {name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => deleteFood(id)}>
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
