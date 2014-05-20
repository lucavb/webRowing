# Information on the REST API of webRowing

This file contains more detailed information on the implementation of the REST API for this project.

The REST API automatically fires up when you start the server.js file.

### API

| Endpoint | Description |
| ---- | --------------- |
| GET /races | Get all the Races (1, 2, 3, ...) that are available |
| GET /sections | Get all the sections (1-V1, 1-V2, 2-V1, ...) that are available |
| GET /news | Get all news that exist at the time |
| GET /startlists/:race_id | Get the startlist for the corresponding race id |
| GET /results/:race_id | Get the result for the corresponding race id |

### GET startlists und GET results

Either handover a number that can be mapped to a race or handover 0 if you want the race that is to be started.