import mongoose from 'mongoose'

const { connect } = mongoose

const connectDatabase = () => {
  connect(process.env.DB_LOCAL_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(con => {
    console.log(`MongoDB Database connected with host: ${con.connection.host}`)
  })
}

export default connectDatabase