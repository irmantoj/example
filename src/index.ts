import mongoose from 'mongoose';
import { createApp } from './app';

//setup db etc...
const connectToMongo = () => {
    try {
        mongoose.connect('mongodb://root:root@localhost:27017');
    } catch(error) {
        console.log(error);
    }
}


connectToMongo();
createApp().listen(3000, () => {
    console.log("http://localhost:3000/");
});