import { type Request, type Response } from "express";
import prisma from "../utils/prisma.js";
import { createRoomSchema } from "../types/types.js";
import { validateLocation } from "./geoController.js";
import { getDistance } from "geolib";


export const createRoom = async (req: Request, res: Response) => {
    
    const parsedRoom = createRoomSchema.safeParse(req.body);
    if(!parsedRoom.success){
        return res.status(411).json({
            message:"incorrect room data schema"
        })
    }

    const { name, latitude, longitude } = req.body;
    if(!req.user){
        return res.json({
            message: "userId is not present"
        })
    }

    let cleanLocation;
    try {
        cleanLocation = validateLocation(latitude, longitude);
        } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }

    try {
        const newRoom = await prisma.room.create({
            data: {
                name,
                latitude: cleanLocation.latitude,  
                longitude: cleanLocation.longitude,
                ownerId: req.user.userId
            }
    });

    return res.status(200).json({
        message:"room created successfully",
        roomId: newRoom.id
    })
    } catch (error) {
        res.status(500).json({ message: "Database creation failed" });
    }
};



export const getNearbyRooms = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude } = req.query;
        let userLoc;
        try {
            userLoc = validateLocation(latitude, longitude);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }

        const allRooms = await prisma.room.findMany();
        const visibleRooms = allRooms.filter((room) => {
        const dist = getDistance(
            { latitude: userLoc.latitude, longitude: userLoc.longitude },
            { latitude: room.latitude, longitude: room.longitude }
        );
            return dist <= room.radius; 
        });

        res.status(200).json({ 
            message: "Success", 
            count: visibleRooms.length, 
            rooms: visibleRooms 
        });

    } catch (error: any) {
        console.error("Error finding rooms:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 3. Edit Room info
export const editRoomsInfo = async (req: Request, res: Response) => {
    const {name} = req.body;
    const {roomId} = req.params;
    const { userId }= req.user!;


    const existingRoom = await prisma.room.findFirst({
        where: {
            id: roomId as string,
            members: {
                some: {
                    id: userId
                }
            }
        }
    });

    if (!existingRoom) {
        return res.status(403).json({ 
            message: "You are not allowed to edit this room (Not a member)." 
        });
    }

    try {
            const updatedRoom = await prisma.room.update({
            where: {
                id: roomId as string
            },
            data: {
                name: name
            }
        });

        return res.json({ message: "Room updated", newname: updatedRoom.name });
    } catch (error) {
        return res.status(500).json({
            error:error
        })
    }
};


export const DeleteRooms = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const {userId} = req.user!; 

        const room = await prisma.room.findUnique({
            where: {
                id: roomId as string
            },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.ownerId !== userId) {
            return res.status(403).json({ 
                message: "Permission denied. Only the owner can delete this room." 
            });
        }

        if (room._count.members > 20) {
            return res.status(400).json({ 
                message: `Cannot delete room. It has ${room._count.members} active members (Limit is 20).` 
            });
        }

        await prisma.room.delete({
            where: {
                id: roomId as string
            }
        });

        return res.status(200).json({ message: "Room deleted successfully" });

    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};