const database = require('../database/database')
const chai = require('chai');
const expect = chai.expect;

const db = database.open()

// Note that in order for some tests to work, the database needs to have some dummy data
const dummyData = {
    id: 'f85cb688-701d-4c64-9087-42d62c8e0fcd',
    email: 'dummyuser@dummyuser.com',
    username: 'dummy.user',
    display_name: 'Dummy User',
    description: 'This is my dummy description',
    status: null,
    date_created: '2023-11-16 19:12:19',
    token: 'f7131fcc-a979-4df1-8164-ffd0fb68a557'
}

describe('Database', () => {
    it('should get data from database', async () => {
        const data = await database.get(db, 'users', {username: dummyData.username})
    
        expect(data[0].id).to.equal(dummyData.id)
    })
    
    it('should return a valid array of rows', async () => {
        const data = await database.search(db, 'users', {username: "user"}, 10)
    
        for (let i in data) {
            expect(data[i].username).to.contain("user")
        }
    })
    
    it("should insert data", async () => {
        const newData = {
            id: 'f7135fcc-a979-4df1-8164-ffd0fb68a557',
            email: 'dummyuser2@dummyuser.com',
            username: 'dummy.user.2',
            display_name: 'Dummy User 2',
            description: 'This is my dummy description',
            password: 'randomHash',
            status: null,
            date_created: '2023-12-16 19:12:19',
            token: 'f85cb688-701d-4c64-9087-42d62c8e0fcd'
        }
        var fail = false;
        try {
            await database.insert(db, 'users', newData)
        } catch (e) {
            fail = true
        }
    
        expect(fail).to.equal(false)
    })
    
    it("should change an already existing row", async () => {
        const changes = {
            description: "This is my dummy description 2"
        }
        var fail = false;
        try {
            await database.write(db, 'users', changes, {id:dummyData.id})
        } catch (e) {
            fail = true
        }
    
        expect(fail).to.equal(false)
    })
    
    it("should return data types", async () => {
        const data_types = await database.getDataTypes(db, 'users')
        
        expect(data_types).to.be.an.instanceOf(Array)
    })
})