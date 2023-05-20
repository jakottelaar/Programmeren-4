const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const { logger } = require("../../src/util/utils");
let userId = 0; //This userId will get the id assignment from the first create user test and use it throughout all the tests up and until it's deleted;
let token = 0;

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-201 Registreren als een nieuwe gebruiker", () => {
  it("TC-201-1 Verplicht veld ontbreekt", (done) => {
    const newUser1 = {
      firstName: "",
      lastName: "userTester",
      street: "123 Test St",
      isActive: true,
      city: "Test city",
      emailAddress: "t.estmanUser@mail.com",
      password: "Password123",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser1)
      .end((err, res) => {
        console.log(res.body);
        expect(err).to.be.null;
        let { status, message } = res.body;

        expect(status).to.equal(400);
        expect(res.body).to.be.an("object");
        expect(message)
          .to.be.a("string")
          .that.contains('"firstName" is not allowed to be empty');

        done();
      });
  });

  it("TC-201-2 Niet-valide emailadres", (done) => {
    const newUser2 = {
      firstName: "userTest",
      lastName: "userTester",
      emailAddress: "invalidemail",
      isActive: true,
      password: "Password123",
      street: "123 Main St",
      city: "Anytown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser2)
      .end((err, res) => {
        let { status, message } = res.body;

        expect(status).to.equal(400);
        expect(res.body).to.be.an("object");
        expect(message).to.equal("Email address is not valid");

        done();
      });
  });

  it("TC-201-3 Niet-valide wachtwoord", (done) => {
    const newUser3 = {
      firstName: "userTest",
      lastName: "userTester",
      emailAddress: "t.man@example.com",
      password: "password",
      street: "123 Main St",
      city: "Anytown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser3)
      .end((err, res) => {
        let { status, message } = res.body;
        expect(status).to.equal(400);
        expect(res.body).to.be.an("object");
        expect(message).to.equal(
          "Password is not valid. It should be at least 8 characters and contain at least one uppercase letter and one digit."
        );

        done();
      });
  });

  it("TC-201-5 User succesvol geregistreer", (done) => {
    const newUser5 = {
      firstName: "userTest",
      lastName: "userTester",
      street: "123 Test St",
      city: "Test city",
      isActive: true,
      emailAddress: "t.estmanUser@mail.com",
      password: "Password123",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser5)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("object");
        let { status, message, data } = res.body;

        expect(status).to.equal(201);
        expect(message)
          .to.be.a("string")
          .that.contains("User created successfully.");
        expect(data).to.be.an("object");

        userId = data.id;
        console.log(data.id);

        done();
      });
  });

  it("TC-201-4 gebruiker bestaat al", (done) => {
    const existingUser = {
      firstName: "userTest",
      lastName: "userTester",
      street: "123 Test St",
      city: "Test city",
      isActive: true,
      emailAddress: "t.estmanUser@mail.com",
      password: "Password123",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(existingUser)
      .end((err, res) => {
        console.log(res.body);
        expect(err).to.be.null;
        let { status, message } = res.body;

        expect(status).to.equal(403);
        expect(res.body).to.be.an("object");
        expect(message).to.be.a("string").that.contains("Email already exists");

        done();
      });
  });
});

describe("UC-202 Opvragen van overzicht van users", () => {
  it("TC-202-1 Toon alle gebruikers (minimaal 2)", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .timeout(5000)
      .end((err, res) => {
        expect(err).to.be.null;

        expect(res.body).to.be.an("object");
        let { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.contain("Users retrieved successfully.");
        expect(data)
          .to.be.an("array")
          .and.to.have.length.of.at.least(2)
          .and.to.satisfy((users) => {
            return users.every((user) => {
              return typeof user === "object";
            });
          });

        done();
      });
  });

  it("TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden", (done) => {
    const searchParams = {
      nonExistingField: "value",
    };

    chai
      .request(server)
      .get("/api/user")
      .query(searchParams)
      .timeout(5000)
      .end((err, res) => {
        expect(err).to.be.null;

        expect(res.body).to.be.an("object");
        let { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.contain("Users retrieved successfully.");
        expect(data).to.be.an("array");

        done();
      });
  });

  describe("UC-202 Opvragen van overzicht van users", () => {
    it("TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld 'isActive'=false", (done) => {
      const searchParams = {
        isActive: 0,
      };

      chai
        .request(server)
        .get("/api/user")
        .query(searchParams)
        .timeout(5000)
        .end((err, res) => {
          expect(err).to.be.null;

          expect(res.body).to.be.an("object");
          let { status, message, data } = res.body;

          expect(status).to.equal(200);
          expect(message).to.contain("Users retrieved successfully.");
          expect(data)
            .to.be.an("array")
            .and.to.satisfy((users) => {
              return users.every((user) => {
                return user.isActive === false;
              });
            });

          done();
        });
    });
  });

  it("TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld 'isActive' = true", (done) => {
    const filters = {
      isActive: 1,
    };

    chai
      .request(server)
      .get("/api/user")
      .query(filters)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");

        const { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal("Users retrieved successfully.");
        expect(data)
          .to.be.an("array")
          .and.to.satisfy((users) => {
            return users.every((user) => {
              return user.isActive === true;
            });
          });

        done();
      });
  });

  it("TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)", (done) => {
    const filters = {
      firstName: "John",
      lastName: "Doe",
    };

    chai
      .request(server)
      .get("/api/user")
      .query(filters)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");

        const { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal("Users retrieved successfully.");
        expect(data).to.be.an("array");

        // Assert that all users in the response match the filter criteria
        data.forEach((user) => {
          expect(user.firstName).to.equal(filters.firstName);
          expect(user.lastName).to.equal(filters.lastName);
        });

        done();
      });
  });
});

describe("UC-203 Opvragen van gebruikersprofiel", () => {
  before((done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ emailAddress: "t.estmanUser@mail.com", password: "Password123" })
      .end((loginErr, loginRes) => {
        token = loginRes.body.data.token;
        logger.info(`Token created: ${token}`);
        done();
      });
  });

  it("TC-203-2 Gebruiker is ingelogd met geldig token", (done) => {
    chai
      .request(server)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(err).to.be.null;

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        let { status, message, data } = res.body;
        expect(status).to.equal(200);
        expect(message).to.equal("User profile retrieved successfully");
        expect(data).to.be.an("object");

        done();
      });
  });
});

describe("UC-204 Opvragen van usergegevens bij ID", () => {
  it("TC-204-2 Gebruiker-ID bestaat niet", (done) => {
    const invalidUserId = userId + 1;

    chai
      .request(server)
      .get(`/api/user/${invalidUserId}`)
      .end((err, res) => {
        expect(err).to.be.null;
        let { status, message } = res.body;

        expect(status).to.equal(404);
        expect(res.body).to.be.an("object");
        expect(message).to.equal(`No user with ID ${invalidUserId}`);

        done();
      });
  });

  it("TC-204-3 Gebruiker-ID bestaat(De user met het gegeven id wordt geretourneerd)", (done) => {
    chai
      .request(server)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("object");
        let { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal("User retrieved by id successfully.");
        expect(data).to.be.an("object");

        done();
      });
  });
});

describe("UC-205 Gebruiker wijzingen", () => {
  it("TC-205-1 Verplicht veld 'emailAddress' ontbreekt", (done) => {
    const newUser = {
      firstName: "userTest",
      lastName: "userTester",
      street: "123 Test St",
      city: "Test city",
      password: "Password123",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser)
      .end((err, res) => {
        expect(err).to.be.null;
        let { status, message } = res.body;
        console.log(res.body);

        expect(status).to.equal(400);
        expect(res.body).to.be.an("object");
        expect(message).to.equal('"emailAddress" is required');

        done();
      });
  });

  it("TC-205-3 Niet-valide telefoonnummer", (done) => {
    const invalidPhoneNumber = "12345";

    chai
      .request(server)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "userTest",
        lastName: "userTester",
        emailAddress: "t.estmanUser@mail.com",
        street: "123 Test St",
        city: "Test city",
        password: "Password123",
        phoneNumber: invalidPhoneNumber,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");

        const { status, message } = res.body;

        expect(status).to.equal(400);
        expect(message).to.equal(
          "Phone number is not valid. It should start with '06' and be followed by 8 digits."
        );

        done();
      });
  });

  it("TC-205-4 Gebruiker bestaat niet", (done) => {
    const nonExistentUserId = userId + 1;
    chai
      .request(server)
      .put(`/api/user/${nonExistentUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "userTest",
        lastName: "Tester",
        emailAddress: "t.estmanUser@mail.com",
        password: "Password123",
        street: "123 Main St",
        city: "Anytown",
        phoneNumber: "0612345678",
      })
      .end((err, res) => {
        let { status, message } = res.body;
        console.log(res.body);

        expect(status).to.equal(404);
        expect(res.body).to.be.an("object");
        expect(message).to.equal(`No user with ID ${nonExistentUserId}`);

        done();
      });
  });

  it("TC-205-6 Gebruiker succesvol gewijzigd", (done) => {
    const updatedUser = {
      firstName: "Testie",
      lastName: "man",
      emailAddress: "t.estman@example.com",
      password: "Newpassword123",
      street: "456 Elm St",
      city: "Othertown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedUser)
      .end((err, res) => {
        let { status, message, data } = res.body;
        console.log(res.body);

        expect(status).to.equal(200);
        expect(res.body).to.be.an("object");
        expect(message).to.equal("Updated user");

        expect(data).to.be.an("object");
        expect(data.firstName).to.equal(updatedUser.firstName);
        expect(data.lastName).to.equal(updatedUser.lastName);
        expect(data.emailAddress).to.equal(updatedUser.emailAddress);
        expect(data.street).to.equal(updatedUser.street);
        expect(data.city).to.equal(updatedUser.city);
        expect(data.phoneNumber).to.equal(updatedUser.phoneNumber);

        done();
      });
  });
});

describe("UC-206 Verwijderen van user", () => {
  it("TC-206-1 Gebruiker bestaat niet", (done) => {
    const nonExistentUserId = userId + 1;

    chai
      .request(server)
      .delete(`/api/user/${nonExistentUserId}`)
      .end((err, res) => {
        let { status, message } = res.body;
        expect(status).to.equal(404);
        expect(res.body).to.be.an("object");
        expect(message).to.equal(`No user with ID ${nonExistentUserId}`);

        done();
      });
  });

  it("TC-206-4 Gebruiker succesvol verwijderd", (done) => {
    chai
      .request(server)
      .delete(`/api/user/${userId}`)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        let { status, message } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal(`User met ID ${userId} is verwijderd`);
        done();
      });
  });
});
