import schedule from "node-schedule";

// 58 23 * * *
const chlngPoints = ()=>{
    schedule.scheduleJob("*/2 * * * * *",()=>{
        console.log("Im Coming")
    })
}

// export default chlngPoints;