import { Paper, Grid, Typography } from "@mui/material";

const Home = ({ style }) => {
  const paperStyle = {
    padding: 20,
    width: 1000,
    //  height: 350,
    backgroundColor: "#ffffff",
    margin: "auto",
  };
  return (
    <Grid style={style} container>
      <Paper elevation={10} style={paperStyle}>
        <Typography textAlign="center" fontSize={30}>
          ARPAV
        </Typography>
        <Typography>
          La questione ambientale è un argomento sempre più importatne nel
          dibattito politico ma è anche una tematica che ci troviamo ad
          affrontare sia come singoli cittadini , attraverso le nostre scelte di
          consumo e i nostri comportamenti quotidiani, sia collettivamente,
          ovvero come società e come Paese. Su quello che sta accadendo al
          nostro Pianeta e di come contrastare gli effetti nefasti del
          cambiamento climatico siamo chiamati tutti a fare una seria
          riflessione. a cosa più allarmante, probabilmente, è che la
          responsabilità non viene sentita da tutti i cittadini allo stesso
          modo. La gente si fa scivolare questo problema di dosso, lo scansa
          come se non fosse roba sua, lo evita come se non riguardasse chiunque
          su questo pianeta. Forse non tutti sanno che il mondo in cui viviamo è
          un mondo patogeno, che l’aria,l’acqua e il cibo nella maggior parte
          dei casi sono inquinati. Studi epidemiologici, confermati anche da
          analisi cliniche e tossicologiche, hanno dimostrato come
          l'inquinamento atmosferico abbia un impatto sanitario notevole; quanto
          più è alta la concentrazione di polveri fini nell'aria, infatti, tanto
          maggiore è l'effetto sulla salute della popolazione. Adottando un
          comportamento più consapevole tutti i cittadini possono contribuire
          quotidianamente alla riduzione dell'inquinamento da polveri fini, ecco
          alcuni consigli:
          <br />- usare di meno e meglio l'automobile
          <br />- far controllare periodicamente il motore e il consumo dei
          pneumatici dell'auto
          <br />- privilegiare nell'acquisto di un'auto nuova modelli a metano o
          GPL e comunque meno inquinanti
          <br />- mouversi in bicicletta o a piedi o usare i mezzi pubblic Il
          mondo ha bisogno di noi e noi abbiamo bisogno del nostro mondo,
          continuare a rovinarlo in questa maniera è un rischio non solo per
          luii ma tutti noi. Mentre restiamo in attesa il mondo soffoca, viene
          schiacciato sotto il peso della noncuranza e dell’indifferenza. Ogni
          secondo è importante, ogni secondo conta, e ogni nostra azione può
          essere fondamentale
        </Typography>
      </Paper>
    </Grid>
  );
};

export default Home;
