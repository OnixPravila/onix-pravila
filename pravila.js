// ============================================================
// ONIX ROLEPLAY — PRAVILA
// Ovdje mijenjaš i dodaješ pravila. index.html NE DIRATI.
//
// **OVAKO**  = zlatni tekst (važna riječ)
// menu       = ime u lijevom meniju
// title      = veliki naslov na stranici
// lead       = rečenica ispod naslova
// items      = lista tačaka
// zones      = kvadratići (safe zone) — opcionalno
// codes      = kratice (LTA) — opcionalno
//
// Novo pravilo: kopiraj cijeli { ... }, zalijepi na dno niza, izmijeni tekst.
// Obriši pravilo: obriši cijeli { ... } uključujući zarez.
// Poslije snimanja: refresh u Chromeu (F5).
// ============================================================

window.PRAVILA = [
  {
    menu: 'Fail RP',
    title: 'FAIL RP',
    lead: 'Ovo pravilo će biti strogo kažnjivo.',
    items: [
      '**KORUPCIJA** policije bez dozvole načelnika.',
      '**DRUKANJE MAFIJA** u policiji bez jakog RP razloga.',
      'Državne organizacije **NE SMEJU** biti uključene u kriminal.',
      'Svi ostali vidovi **NEPRAVILNOG** držanja karaktera biće strogo sankcionisani.'
    ]
  },
  {
    menu: 'PG',
    title: 'PG',
    lead: 'PG na serveru je kažnjiv. Ne možete raditi stvari koje su nemoguće u realnom životu.',
    items: [
      'Skokovi vozilima koja nisu predviđena za to. Normalni skokovi kroserom su dozvoljeni.',
      'Vozila koja nemaju offroad gume ne mogu da se kreću offroad.',
      'Udaranje vozilima pri brzini većoj od **50 KM/H**.',
      'Sva stanja vašeg karaktera koja zahtevaju roleplay povrede: padovi, ranjavanja, saobraćajne nesreće...',
      'Pričati iz vozila na kojima su prozori zatvoreni. Zbog D-synca, neophodno je koristiti **ME/DO** komande da otvarate i zatvarate prozor.',
      'Korišćenje radija i telefona dok ste u vodi.',
      'Sve ostale PG radnje će biti kažnjive.'
    ]
  },
  {
    menu: 'Fear',
    title: 'FEAR',
    lead: '**STRAH** je sastavni deo života. Ovo pravilo će se najstrože kažnjavati. Niko nije svemoguć.',
    items: [
      'Podignuto je vatreno oružje na vas — dužni ste da podignete ruke i stanete.',
      'Talačka situacija podrazumeva isključivo situaciju u kojoj neko drži pištolj **NA ČELU** ili je u neposrednoj blizini. Tada se stupa u pregovore.',
      'Da li je vas pet u grupi ili samo jedan: ako je na vas podignuto oružje, morate podići ruke. Može da puca samo onaj ko je iza leđa licu koje vam je uperilo vatreno oružje, ako time ne ugrožavate život ljudima koje spasavate. Na talačkim situacijama ne sme da puca niko, osim snajperiste PD-a uz dozvolu načelnika.',
      'Vi ne znate da li PD može da puca prvi ili ne. Ponašajte se u skladu s tim da postoji mogućnost da pucaju na vas ako ne sarađujete ili ih ugrozite.',
      'Nošenje maski bez RP razloga je strogo zabranjeno, automatski baca sumnju na vas i smatra se kršenjem pravila. Maske su dozvoljene isključivo dok ste uključeni u trenutne ilegalne radnje.',
      'Bahato ophođenje prema policiji koja radi svoj posao. Policajac je autoritet. Dužni ste da pokažete poštovanje, kao i strah od mogućih posledica.'
    ]
  },
  {
    menu: 'MG',
    title: 'MG',
    lead: 'Na serveru mogu da vas prepoznaju po glasu, mogu da posumnjaju na vas zbog trenutnog outfita. Morate biti kreativni.',
    items: [
      'OOC razgovor u toku roleplay-a smatraće se i KRP-om i MG-om.',
      'Bilo koji drugi vid komunikacije između igrača dok su na serveru, dogovaranje RP-a i slično, rezultovaće banom. U najboljem slučaju vremenskim banom i polaganjem WL-a.',
      'Pisanje streamerima na streamu dok ste u RP-u, i korišćenje bilo čega u RP-u što je viđeno na streamu, biće najstrože kažnjavano.',
      'Čitanje ME/DO komandi naglas, te verbalno odgovaranje na iste.',
      'Ostali vidovi kršenja ovog pravila su takođe kažnjivi.'
    ]
  },
  {
    menu: 'CB',
    title: 'CB',
    lead: 'Strogo zabranjen.',
    items: [
      '**NE SMETE** provocirati policiju zato što je vama dosadno.',
      '**NE SMETE** bežati bez ikakvog RP razloga.',
      '**NE SMETE** bežati od policije zbog saobraćajnog prekršaja.',
      'Od policije **SMETE** bežati isključivo ako pri samom zaustavljanju rizikujete zatvorsku kaznu.'
    ]
  },
  {
    menu: 'KRP',
    title: 'KRP',
    lead: 'Strogo zabranjen.',
    items: [
      '**NE SMETE** izlaziti iz uloge dok role-play traje.',
      '**NE SMETE** zvati bolnicu ako vas je mafija ispucala i nije završila RP sa vama.',
      '**NE SMETE** drugim igračima ubijati RP!'
    ]
  },
  {
    menu: 'RP2WIN',
    title: 'RP2WIN',
    lead: 'Strogo zabranjen.',
    items: [
      '**AMNEZIJA NE POSTOJI.** Ne postoji ništa što vam može izbrisati sećanje osim perme.',
      '**NE SMETE** u bolnici roleplay-ati povrede koje nemate, kao ni ublažavati povrede. Npr. ispucan, pa roleplay-a da je onesvešćen zbog hrane i vode.',
      'Korišćenje ME/DO komandi kako bi izašli kao **POBEDNIK** u RP-u.'
    ]
  },
  {
    menu: 'Safe Zone',
    title: 'SAFE ZONE',
    lead: 'Pravilo safe zone.',
    items: [
      '**NE SMETE** obavljati bilo koje ilegalne radnje u safe zonama: primopredaje, otmice, tuče, dogovori mesta sastanka i slično.',
      'Kidnapovanje igrača u SZ-u je dozvoljeno isključivo **AKO JE RP ZAPOČEO VAN ISTE**.',
      '**PERMA U SZ-U JE DOZVOLJENA.**'
    ],
    zonesTitle: 'Safe zone na serveru su:',
    zones: [
      'PD',
      'Bolnica',
      'Sheriff stanica',
      'Glavna garaža',
      'Mehaničarske van ilegale',
      'Aerodrom',
      'Svi poslovi',
      'Motel'
    ]
  },
  {
    menu: 'LTA',
    title: 'LTA',
    lead: '**LTA rezultira banom i dodatnim sankcijama.**',
    codesTitle: 'Pravila koja će takođe biti kažnjiva su:',
    codes: ['DTA', 'BA', 'VDM', 'RK', 'SK', 'PVE', 'CK', 'TK']
  }
];
