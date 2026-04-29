const express = require("express")
const { Pool } = require("pg")

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const SECRET = "monsecretjwt"


const app = express()
app.use(express.json())




const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "escale",
    password: "user123",
    port: 5432,


})

app.get("/vols", verifierToken, async (req, res) =>{
    const result = await pool.query("SELECT * FROM vols")
    res.json(result.rows)

})

app.post("/vols", async (req, res)=>{
    const nouveauVol = await pool.query(
    "INSERT INTO vols (numero, statut) VALUES ($1, $2)",
    [req.body.numero, req.body.statut]
)
   
    res.json({ message: "Vol ajouté !", vol: nouveauVol })


})

app.delete("/vols/:numero", async (req, res)=>{
        const supprVol = await pool.query(
            "DELETE FROM vols WHERE numero = $1",
            [req.params.numero]
        )
        
    res.json({ message: "Vol supprimé !", vol: supprVol })





})

app.post("/register", async (req, res)=>{
    const {email, password} = req.body
    const hash = await bcrypt.hash(password, 10)
    await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, hash]

    )
    res.json({message: "Compte créé !"})


})

app.post("/login", async (req, res) =>{
        const {email, password} = req.body
        
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        )

        const user = result.rows[0]

        if(!user){
            return res.json({ message: "Utilisateur introuvable"})
        }

        const match = await bcrypt.compare(password, user.password)

        if(!match){
            return res.json({ message: "Mot de passe incorrect"})
        }

        const token = jwt.sign({id: user.id, email: user.email}, SECRET)
        res.json({token})


})

function verifierToken(req, res, next) {
    const token = req.headers.authorization.split(" ")[1]
    console.log("Token reçu :", token)

    if(!token){
        return res.json({message: "Token manquant"})
    }

    try {
        const decoded = jwt.verify(token, SECRET)
        req.user = decoded
        next()
    } catch {
        return res.json({message: "Token invalide"})
    }

}



// const vols = [
//     { numero: "AF123", statut: "à l'heure" },
//     { numero: "EK456", statut: "retardé" },
//     { numero: "TU789", statut: "annulé" }
// ]

// app.get("/", (req, res) => {
//     res.send("Serveur en marche !")
// })

// app.get("/vols", (req, res) => {
//     res.json(vols)
// })

// app.get("/vols/:numero", (req, res) => {
//     const vol = vols.find(v => v.numero === req.params.numero)
//     if (vol) {
//         res.json(vol)
//     } else {
//         res.json({ message: "Vol introuvable" })
//     }
// })

// app.post("/vols", (req, res) => {
//     const nouveauVol = req.body
//     vols.push(nouveauVol)
//     res.json({ message: "Vol ajouté !", vol: nouveauVol })
// })

app.listen(3000, () => {
    console.log("Serveur démarré sur le port 3000")
})