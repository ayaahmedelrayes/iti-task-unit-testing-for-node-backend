const request = require("supertest");
const app = require("..");
const { clearDatabase } = require("../db.connection");
const { default: mongoose } = require("mongoose");

describe("user routes", () => {
  let testAgent = request(app);
  afterEach(async () => {
    await clearDatabase();
  });
  it("(GET /user ) should respond with users=[]", async () => {
    let res = await testAgent.get("/user");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveSize(0);
  });
  it("(POST /user/signup ) should respond with new user", async () => {
    let newUser = { name: "Ali", email: "test@test.com", password: "1234567" };
    let res = await testAgent.post("/user/signup").send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toEqual(newUser.name);
  });

  it("(POST /user/signup ) with (email exists) should respond with status 400", async () => {
    let newUser = { name: "Hoda", email: "test@test.com", password: "1234567" };
    await testAgent.post("/user/signup").send(newUser);

    let res = await testAgent.post("/user/signup").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("email is already exists");
  });
  it("(POST /user/login ) should respond with token", async () => {
    let newUser = { name: "Hoda", email: "test@test.com", password: "1234567" };
    await testAgent.post("/user/signup").send(newUser);

    let res = await testAgent.post("/user/login").send(newUser);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.split(".")).toHaveSize(3);
  });
  it("(GET /user/id ) should respond with user with id", async () => {
    let newUser = { name: "Hoda", email: "test@test.com", password: "1234567" };

    let res1 = await testAgent.post("/user/signup").send(newUser);
    let id = res1.body.data._id;
    let res = await testAgent.get("/user/" + id);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id)
  });
  it("(GET /user/id ) with id not exists should respond with user not found", async () => {
    
    let id = new mongoose.Types.ObjectId
    let res = await testAgent.get("/user/" + id);
    expect(res.status).toBe(404);
    expect(res.body.message).toContain("no user")
  });
  // lab -----------------------------
  it("(GET /user/search) should respond with the correct user", async () => {
    
    const newUser = { name: "aya", email: "aya@test.com", password: "123" };
    await request(app).post("/user/signup").send(newUser);


    const res = await request(app)
        .get('/user/search')
        .query({ name: "aya" });

    
    expect(res.status).toBe(200);
    
    
    expect(res.body.data.name).toBe("aya"); 
});
it("GET /user/search with invalid name should respond with status 404 and the message", async() => {
  const newUser = { name: "basma", email: "basma@test.com", password: "123" };
    await request(app).post("/user/signup").send(newUser);


    const res = await request(app)
        .get('/user/search')
        .query({ name: "aya" });

    
    expect(res.status).toBe(404);
    
    
    
 })
});
