const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const { logger } = require("../../src/util/utils");

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-401 Aanmelden voor maaltijd", () => {
  it.only("TC-401-1 Niet ingelogd", (done) => {
    //Create a account and a meal with it which can be put in here.
    chai
      .request(server)
      .post("/api/meal/1/participate")
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(401);
          expect(res.body)
            .to.have.property("message")
            .to.equal("Unauthorized: Missing or invalid token");
          expect(res.body).to.have.property("data").to.be.empty;

          done();
        }
      });
  });
});
