import bcrypt from 'bcryptjs';import {connectDb,disconnectDb} from '../config/db.js';import {User,Building,Floor,Waypoint,RouteEdge,EmergencyFacility,Hazard} from '../models/models.js';
await connectDb();await Promise.all([User.deleteMany({}),Building.deleteMany({}),Floor.deleteMany({}),Waypoint.deleteMany({}),RouteEdge.deleteMany({}),EmergencyFacility.deleteMany({}),Hazard.deleteMany({})]);const b=await Building.create({name:'CSE Building',code:'CSE',latitude:21.895,longitude:80.187,address:'SafeAR Demo Campus'});const [f1,f2]=await Floor.create([{buildingId:b.id,name:'Ground Floor',level:0},{buildingId:b.id,name:'First Floor',level:1}]);const ws=await Waypoint.create([
{name:'Lobby',buildingId:b.id,floorId:f1.id,position:{x:0,y:0,z:0}},
{name:'Corridor A',buildingId:b.id,floorId:f1.id,position:{x:10,y:0,z:0}},
{name:'Corridor B',buildingId:b.id,floorId:f1.id,position:{x:20,y:0,z:0}},
{name:'Exit A',buildingId:b.id,floorId:f1.id,position:{x:30,y:0,z:0}},
{name:'First Aid',buildingId:b.id,floorId:f1.id,position:{x:10,y:0,z:10}},
{name:'Exit B',buildingId:b.id,floorId:f1.id,position:{x:20,y:0,z:10}}
]);const by=n=>ws.find(w=>w.name===n).id;await RouteEdge.create([
['Lobby','Corridor A',10],['Corridor A','Corridor B',10],['Corridor B','Exit A',10],['Corridor A','First Aid',10],['First Aid','Exit B',12],['Corridor B','Exit B',10]
].map(([a,c,d])=>({buildingId:b.id,from:by(a),to:by(c),distance:d,width:1.8})));
await EmergencyFacility.create([{buildingId:b.id,floorId:f1.id,waypointId:by('Exit A'),type:'EXIT',name:'Emergency Exit A',accessible:true},{buildingId:b.id,floorId:f1.id,waypointId:by('Exit B'),type:'EXIT',name:'Emergency Exit B',accessible:true},{buildingId:b.id,floorId:f1.id,waypointId:by('First Aid'),type:'FIRST_AID',name:'First Aid Room',accessible:true}]);
await Hazard.create({buildingId:b.id,waypointIds:[by('Corridor B')],name:'Demo blocked corridor',description:'Development-only sample hazard',severity:'HIGH',active:false});await User.create({name:'SafeAR Admin',email:'admin@safear.local',passwordHash:await bcrypt.hash('Admin@12345',12),role:'ADMIN'});await User.create({name:'Demo Student',email:'user@safear.local',passwordHash:await bcrypt.hash('User@12345',12),role:'USER'});console.log('Seed complete. Admin admin@safear.local / Admin@12345');await disconnectDb();
