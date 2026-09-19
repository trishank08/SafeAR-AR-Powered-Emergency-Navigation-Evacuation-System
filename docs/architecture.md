# Architecture

React is the user/admin web client. Node/Express owns authentication, authorization, building data, hazard state, route calculation, and business rules. MongoDB stores configurable campus data. Socket.IO distributes hazard and route invalidation events. Flask is a deliberately narrow ML service: it accepts route features and returns a risk estimate. Unity is a separate mobile client responsible for AR rendering and device capabilities.

Safety decisions are authoritative in Node: AI cannot invent facilities/routes, and ML cannot override route validation.
