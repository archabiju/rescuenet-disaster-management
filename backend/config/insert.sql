--Insert sample data into the tables

INSERT INTO users (user_id, full_name, email, phone, role) VALUES
(1, 'Admin User', 'admin@gmail.com', '9999999999', 'Admin'),
(2, 'Ravi Kumar', 'ravi@gmail.com', '8888888888', 'Coordinator'),
(3, 'Anita Sharma', 'anita@gmail.com', '7777777777', 'Responder'),
(4, 'Rahul Das', 'rahul@gmail.com', '6666666666', 'Volunteer'),
(5, 'Neha Verma', 'neha@gmail.com', '9555555555', 'Responder'),
(6, 'Amit Singh', 'amit@gmail.com', '9444444444', 'Volunteer'),
(7, 'Priya Menon', 'priya@gmail.com', '9333333333', 'Coordinator');

INSERT INTO disaster_zones VALUES
(1, 'Chennai Flood Zone', 13.0827, 80.2707, 5000, 4, CURRENT_TIMESTAMP, 'Active', 'Flood', 'Rescue, Food'),
(2, 'Kerala Landslide Area', 10.8505, 76.2711, 3000, 5, CURRENT_TIMESTAMP, 'Active', 'Landslide', 'Medical'),
(3, 'Odisha Cyclone Zone', 20.9517, 85.0985, 6000, 5, CURRENT_TIMESTAMP, 'Active', 'Cyclone', 'Evacuation'),
(4, 'Assam Flood Area', 26.2006, 92.9376, 4000, 4, CURRENT_TIMESTAMP, 'Active', 'Flood', 'Food, Shelter');

INSERT INTO shelters VALUES
(1, 'Chennai Central Shelter', 'Central Chennai', 13.08, 80.27, 500, 120, 1),
(2, 'Kerala Relief Camp', 'Wayanad', 11.68, 76.13, 300, 80, 2),
(3, 'Odisha Emergency Camp', 'Bhubaneswar', 20.95, 85.09, 400, 150, 3),
(4, 'Assam Relief Center', 'Guwahati', 26.20, 92.93, 350, 100, 4);

INSERT INTO resource_centers VALUES
(1, 'Chennai Warehouse', 13.09, 80.28, 'Chennai', 'Suresh', '9991112222'),
(2, 'Kochi Warehouse', 9.93, 76.26, 'Kochi', 'Mahesh', '8882223333'),
(3, 'Odisha Supply Hub', 20.96, 85.10, 'Bhubaneswar', 'Ramesh', '9777777777'),
(4, 'Assam Central Store', 26.21, 92.94, 'Guwahati', 'Anil', '9666666666');

INSERT INTO resources VALUES
(1, 'Drinking Water', 'Liters', 100),
(2, 'Medical Kit', 'Units', 50),
(3, 'Blankets', 'Units', 200),
(4, 'Rice Bags', 'Kg', 500),
(5, 'Baby Food', 'Packs', 100);

INSERT INTO inventories VALUES
(1, 1, 1, 500, 'Emergency'),
(2, 1, 2, 200, 'Medical'),
(3, 2, 3, 300, 'Relief'),
(4, 3, 4, 1000, 'Relief'),
(5, 3, 1, 800, 'Emergency'),
(6, 4, 5, 150, 'Nutrition');

INSERT INTO rescue_teams VALUES
(1, 'Alpha Team', 3, 'Available', 1, '9000000001'),
(2, 'Bravo Team', 4, 'Assigned', 2, '9000000002'),
(3, 'Charlie Team', 5, 'Available', 3, '9000000003'),
(4, 'Delta Team', 6, 'Available', 4, '9000000004');

INSERT INTO team_members VALUES
(1, 1, 3),
(2, 1, 4),
(3, 2, 4),
(4, 3, 5),
(5, 3, 6),
(6, 4, 7);

INSERT INTO vehicles VALUES
(1, 'TN01AB1234', 'Ambulance', 4, 1, 1),
(2, 'KL07CD5678', 'Truck', 20, 2, 2),
(3, 'OD02EF9999', 'Boat', 15, 3, 3),
(4, 'AS01GH1111', 'Truck', 25, 4, 4);


INSERT INTO citizen_requests VALUES
(1, 'Suresh', '9876543210', 'Need food and water', 13.07, 80.26, 1, 3, 'Pending'),
(2, 'Meena', '9123456780', 'Medical emergency', 10.85, 76.27, 2, 5, 'Assigned'),
(3, 'Rajan', '9001112233', 'Evacuation needed', 20.95, 85.10, 3, 5, 'Pending'),
(4, 'Lakshmi', '9112223344', 'Shelter required', 26.20, 92.94, 4, 4, 'Pending');

INSERT INTO team_assignments VALUES
(1, 1, 1, 1, 2, CURRENT_TIMESTAMP),
(2, 2, 2, 2, 1, CURRENT_TIMESTAMP),
(3, 3, 3, 3, 7, CURRENT_TIMESTAMP),
(4, 4, 4, 4, 5, CURRENT_TIMESTAMP);


COMMIT;
