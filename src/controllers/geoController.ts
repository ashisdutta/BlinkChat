import { type Request, type Response } from "express";
import prisma from "../utils/prisma.js";
import { getDistance } from "geolib";


export const validateLocation = (lat: any, lng: any) => {
  // 1. Parse to numbers (in case frontend sends strings)
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 2. Check if they are real numbers
    if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid Location: Latitude and Longitude must be numbers.");
    }

    // 3. Check Earth's limits
    if (latitude < -90 || latitude > 90) {
        throw new Error("Invalid Latitude: Must be between -90 and 90.");
    }
    if (longitude < -180 || longitude > 180) {
        throw new Error("Invalid Longitude: Must be between -180 and 180.");
    }

    return { latitude, longitude };
    };


    