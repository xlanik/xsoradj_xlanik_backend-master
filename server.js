const express = require('express');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()
const mongoose = require('mongoose');

const databaseUri = process.env.DATABASE_URI

app.use(express.json()) //https://stackoverflow.com/questions/18542329/typeerror-cannot-read-property-id-of-undefined

//v envcku v tom database uri si treb premenit nazov databazy z MyfirstDatabase na Autoservis

const Technician = require('./databaseModels/Technicians')
const Customer = require('./databaseModels/Customer')
const Car = require('./databaseModels/Cars')
const RepairedCar = require('./databaseModels/RepairedCars')

mongoose.connect(databaseUri, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

//API volania pre technikov
app.route('/Technicians')
  .get(async (req, res) => {
    try {
      const technicians = await Technician.find()
      res.json(technicians)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
  .post(async (req, res) => {
    const technician = new Technician({
      name: req.body.name,
      password: req.body.password
    })
    try {
      const newTechnician = await technician.save()
      res.status(201).json(newTechnician)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  })
  
  app.route('/Technicians/:id')
  .get(getOneTechnician, async (req, res) => {
    res.json(res.technician)
  })

app.route('/login')
  .post(async (req, res) => {
    try{
      const loginCustomer = await Customer.findOne({ name: req.body.name })
      if(loginCustomer){
        if(loginCustomer.password == req.body.password){
          res.status(400).json({ loginCustomer })
        }
        else{
          res.status(400).json({ message: "Zle prihlasovacie udaje" })
        }
      }
      else{
        const loginTechnician = await Technician.findOne({ name: req.body.name })
        if(loginTechnician){
          if(loginTechnician.password == req.body.password){
            res.status(400).json({loginTechnician })
          }
        else{
          res.status(400).json({ message: "Zle prihlasovacie udaje" })
        }
        }
      }
    }
    catch(err){
      res.status(400).json({ message: err.message })
    }
  })

//API volania zakaznikov
app.route('/Customers')
  .get(async (req, res) => {
    try {
      const customers = await Customer.find()
      res.json(customers)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
  .post(async (req, res) => {
    const customer = new Customer({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      password: req.body.password
    })
    try {

      const usedName = await Customer.findOne({ name: req.body.name })
      const usedPhoneNumber = await Customer.findOne({ phoneNumber: req.body.phoneNumber })
      const usedEmail = await Customer.findOne({ email: req.body.email })

      if(usedName)  res.status(400).json({ message: "Uzivatel s tymto menom uz je zaregistrovany" })
      else if(usedPhoneNumber)  res.status(400).json({ message: "Uzivatel s tymto telefonnym cislom uz je zaregistrovany" })
      else if(usedEmail)  res.status(400).json({ message: "Uzivatel s tymto emailom uz je zaregistrovany" })

      if(!usedName && !usedPhoneNumber && !usedEmail){
        const newCustomer = await customer.save()
        res.status(201).json(newCustomer)
      }

    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  })

app.route('/Customers/:id')
  .get(getOneCustomer, async (req, res) => {
    res.json(res.customer)
  })
  .delete(getOneCustomer, async (req, res) => {
    try {
      await res.customer.remove()
      res.json({ message: 'Customer was deleted from DB...' })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })


//API volania pre auta v servise
app.route('/Cars')
  .get(async (req, res) => {
    try {
      const cars = await Car.find()
      res.json(cars)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
  .post(async (req, res) => {
    const car = new Car({
      customer_id: req.body.customer_id,
      technician_id: req.body.technician_id,
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      oilChange: req.body.oilChange,
      filterChange: req.body.filterChange,
      tireChange: req.body.tireChange,
      engineService: req.body.engineService,
      state: req.body.state,
      description: req.body.description,
      image_url: req.body.image_url,
      number_plate: req.body.number_plate
    })
    try {
      const newCar = await car.save()
      res.status(201).json(newCar)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  })

app.route('/Cars/:id')
  .get(getOneCar, async (req, res) => {
    res.json(res.car)
  })
  .delete(getOneCar, async (req, res) => {
    try {
      await res.car.remove()
      res.json({ message: 'Car was deleted from DB...' })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
  .patch(getOneCar, async (req, res) => {
    res.car.oilChange = false
    res.car.filterChange = false
    res.car.tireChange = false
    res.car.engineService = false
    res.car.state = "repaired"
    res.car.last_service = new Date()

    if (req.body.description != null) {
      res.car.description = req.body.description
    }

    try {
      const updatedCar = await res.car.save()
      res.json(updatedCar)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  })



//API volania pre auta, ktore su opravene
app.route('/RepairedCars')
  .get(async (req, res) => {
    try {
      const repairedCars = await RepairedCar.find()
      res.json(repairedCars)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
  .post(async (req, res) => {
    const repairedCar = new RepairedCar({
      customer_id: req.body.customer_id,
      technician_id: req.body.technician_id,
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      oilChange: req.body.oilChange,
      filterChange: req.body.filterChange,
      tireChange: req.body.tireChange,
      engineService: req.body.engineService,
      state: req.body.state,
      description: req.body.description,
      image_url: req.body.image_url,
      number_plate: req.body.number_plate,
      last_service: req.body.last_service
    })
    try {
      const NewRepairedCar = await repairedCar.save()
      res.status(201).json(NewRepairedCar)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  })



app.get('/', function(req, res) {
  res.send('Hello jakubko!')
});


app.listen(port, function() {
  console.log(`App listening on port ${port}!`)
});


async function getOneCustomer(req, res, next) {
  let customer
  try {
    customer = await Customer.findById(req.params.id)
    if (customer == null) {
      return res.status(404).json({ message: 'Customer is not in the DB' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.customer = customer
  next()
}

async function getOneTechnician(req, res, next) {
  let technician
  try {
    technician = await Technician.findById(req.params.id)
    if (technician == null) {
      return res.status(404).json({ message: 'Technician is not in the DB' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.technician = technician
  next()
}

async function getOneCar(req, res, next) {
  let car
  try {
    car = await Car.findById(req.params.id)
    if (car == null) {
      return res.status(404).json({ message: 'Car is not in the DB' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.car = car
  next()
}