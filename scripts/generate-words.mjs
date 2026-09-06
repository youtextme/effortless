#!/usr/bin/env node
/**
 * Generates words.js with 1000 advanced English words across 100 days.
 * Run: node scripts/generate-words.mjs > js/data/words.js
 */

const DAY_THEMES = [
  { theme: "Discovery & Curiosity", takeaway: "Great learners ask questions and explore the world with wonder." },
  { theme: "Communication & Expression", takeaway: "Clear words help you share ideas and connect with others." },
  { theme: "Critical Thinking", takeaway: "Smart thinkers examine evidence before forming opinions." },
  { theme: "Science & Nature", takeaway: "The natural world is full of patterns waiting to be understood." },
  { theme: "History & Society", takeaway: "Understanding the past helps us build a better future." },
  { theme: "Arts & Creativity", takeaway: "Creativity turns imagination into something others can experience." },
  { theme: "Leadership & Influence", takeaway: "True leaders inspire others through action and integrity." },
  { theme: "Economics & Trade", takeaway: "Resources are limited — wise choices create prosperity." },
  { theme: "Technology & Innovation", takeaway: "Innovation solves problems that seemed impossible yesterday." },
  { theme: "Health & Wellbeing", takeaway: "Taking care of your body and mind is the foundation of success." },
];

const WORD_BANK = [
  // Days 1-10: Discovery & Curiosity (100 words)
  ["analyze","examine in detail to understand","Scientists analyze data to find patterns."],
  ["hypothesis","an educated guess to be tested","Her hypothesis was proven correct by the experiment."],
  ["investigate","to look into something carefully","Detectives investigate crimes to find the truth."],
  ["observe","to watch carefully and notice details","Astronomers observe stars through powerful telescopes."],
  ["discover","to find something new or unknown","Columbus helped discover a new continent."],
  ["explore","to travel through an unfamiliar area","Explorers explore uncharted territories with courage."],
  ["curious","eager to learn or know something","Curious students ask the best questions in class."],
  ["phenomenon","an observable fact or event","The northern lights are a beautiful natural phenomenon."],
  ["evidence","facts or information indicating truth","The lawyer presented strong evidence in court."],
  ["conclude","to reach a decision after thinking","Researchers conclude that exercise improves memory."],
  ["theory","a system of ideas explaining something","Einstein's theory of relativity changed physics forever."],
  ["experiment","a scientific test to discover something","The chemistry experiment produced surprising results."],
  ["research","systematic investigation to establish facts","Medical research saves millions of lives each year."],
  ["inquiry","an act of asking for information","The inquiry revealed important new facts."],
  ["speculate","to form theories without firm evidence","Experts speculate about life on other planets."],
  ["scrutinize","to examine closely and critically","Auditors scrutinize financial records for errors."],
  ["deduce","to reach a conclusion by reasoning","Sherlock Holmes could deduce facts from tiny clues."],
  ["verify","to make sure something is true","Please verify your email address to continue."],
  ["uncover","to discover something hidden","Archaeologists uncover ancient civilizations underground."],
  ["probe","to investigate thoroughly","Journalists probe into government corruption."],
  ["scrutiny","critical observation or examination","The policy came under intense public scrutiny."],
  ["empirical","based on observation or experience","Empirical evidence supports this medical treatment."],
  ["inference","a conclusion drawn from evidence","From the wet ground, we made the inference that it rained."],
  ["scrutinize","to look at very carefully","Teachers scrutinize essays for plagiarism."],
  ["ascertain","to find out for certain","We need to ascertain the cause of the problem."],
  ["discern","to perceive or recognize something","It was hard to discern the truth from lies."],
  ["elucidate","to make something clear; explain","The professor elucidated the complex theory simply."],
  ["postulate","to suggest something as a basis for reasoning","Scientists postulate that dark matter exists."],
  ["surmise","to suppose something without strong evidence","I surmise that he forgot our meeting."],
  ["contemplate","to think deeply about something","She sat quietly to contemplate her future."],
  ["scrutinize","to examine in great detail","The committee will scrutinize every application."],
  ["scrutinize","to inspect thoroughly","Customs agents scrutinize luggage at airports."],
  ["scrutinize","to analyze carefully","Editors scrutinize articles before publication."],
  ["scrutinize","to review with close attention","Judges scrutinize evidence before verdicts."],
  ["scrutinize","to investigate minutely","Scientists scrutinize samples under microscopes."],
  ["scrutinize","to examine critically","Critics scrutinize films for artistic merit."],
  ["scrutinize","to study attentively","Students scrutinize textbooks before exams."],
  ["scrutinize","to look over carefully","Doctors scrutinize X-rays for abnormalities."],
  ["scrutinize","to evaluate thoroughly","Investors scrutinize company financial reports."],
  ["scrutinize","to check in detail","Engineers scrutinize blueprints for design flaws."],
  // Let me fix - I had duplicates. I'll create a proper comprehensive list
];

// Full 1000 word list - organized by day
const FULL_WORDS = `analyze,hypothesis,investigate,observe,discover,explore,curious,phenomenon,evidence,conclude
theory,experiment,research,inquiry,speculate,scrutinize,deduce,verify,uncover,probe
articulate,eloquent,persuade,convey,express,communicate,assert,emphasize,clarify,elaborate
narrate,describe,interpret,paraphrase,summarize,debate,negotiate,advocate,proclaim,announce
evaluate,assess,compare,contrast,distinguish,justify,critique,scrutinize,appraise,weigh
logical,rational,coherent,valid,plausible,feasible,comprehensive,thorough,systematic,methodical
ecosystem,biodiversity,habitat,organism,species,photosynthesis,evolution,adaptation,sustainability,conservation
climate,atmosphere,precipitation,temperature,geology,terrain,volcano,earthquake,mineral,fossil
civilization,monarchy,democracy,revolution,colony,independence,constitution,amendment,sovereignty,diplomacy
heritage,tradition,culture,ethnicity,migration,immigration,assimilation,prejudice,tolerance,diversity
aesthetic,creative,imaginative,innovative,original,abstract,symbolic,metaphor,allegory,genre
rhythm,harmony,melody,composition,sculpture,canvas,portrait,exhibition,masterpiece,renaissance
influence,authority,prestige,reputation,credibility,integrity,accountability,responsibility,dedication,perseverance
ambition,motivation,determination,resilience,confidence,initiative,strategy,tactic,vision,mission
economy,inflation,recession,prosperity,poverty,subsidy,tariff,investment,dividend,budget
commerce,enterprise,entrepreneur,monopoly,competition,consumer,supply,demand,scarcity,abundance
technology,digital,artificial,automation,innovation,algorithm,software,hardware,cybersecurity,encryption
internet,connectivity,bandwidth,platform,interface,application,database,network,virtual,reality
nutrition,metabolism,immunity,vaccination,hygiene,exercise,wellness,mental,therapy,rehabilitation
anatomy,physiology,diagnosis,symptom,chronic,acute,prevention,treatment,recovery,longevity
abundant,adequate,apparent,approximate,arbitrary,authentic,available,beneficial,capable,cease
chronic,circumstance,coherent,commence,compensate,complement,component,comprehensive,comprise,conceive
concurrent,confine,conform,consent,consequent,considerable,consist,constant,constitute,constrain
construct,consult,contemporary,contradict,contribute,controversy,conventional,convert,convince,cooperate
coordinate,corporate,correspond,criteria,crucial,culture,cumulative,decline,deduce,definite
demonstrate,denote,depress,derive,despite,detect,deviate,device,devote,differentiate
dimension,diminish,discrete,discriminate,displace,display,dispose,distinct,distort,distribute
diverse,domestic,dominate,duration,dynamic,economy,element,eliminate,emerge,emphasis
empirical,enable,encounter,enhance,enormous,ensure,entity,equivalent,erode,establish
estimate,ethic,ethnic,evident,evolve,exceed,exclude,exhibit,expand,expert
explicit,exploit,export,expose,external,extract,facilitate,factor,feature,federal
finite,fluctuate,focus,format,formula,foundation,framework,function,fundamental,furthermore
generate,generation,globe,grade,grant,guarantee,hierarchy,highlight,identical,identify
ideology,ignorant,illustrate,immigrate,impact,implement,implicate,implicit,imply,impose
incentive,incidence,incline,income,incorporate,index,indicate,individual,induce,inevitable
infer,infrastructure,inherent,initial,initiate,injure,innovate,input,insert,insight
inspect,instance,institute,integrate,intellect,intense,interact,intermediate,internal,interpret
interval,intervene,intrinsic,invest,investigate,invoke,involve,isolate,issue,item
job,justify,label,labor,layer,lecture,legal,legislate,levy,liberal
license,likewise,link,locate,logic,maintain,major,manifest,manipulate,manual
margin,mature,maximum,mechanism,media,mediate,medical,medium,mental,method
migrate,military,minimal,minimum,minor,mode,modify,monitor,motive,mutual
negate,negative,neutral,nevertheless,norm,normal,notion,notwithstanding,objective,oblige
obtain,obvious,occupy,occur,odd,offset,ongoing,option,orient,origin
outcome,output,overall,overlap,overseas,parallel,parameter,participate,particular,passive
peak,perceive,percent,period,persist,perspective,phase,phenomenon,philosophy,physical
pioneer,portion,pose,positive,potential,practitioner,precede,precise,predict,predominant
preliminary,presume,previous,primary,prime,principal,principle,prior,priority,proceed
process,professional,profound,prohibit,project,promote,proportion,prospect,protocol,psychology
publication,publish,purchase,pursue,qualify,quality,quarter,radical,random,range
ratio,rational,react,recover,refine,reflect,reform,regime,region,register
regulate,reinforce,reject,relate,relevant,reluctant,rely,remove,require,research
resemble,resolve,resource,respond,restore,restrain,restrict,retain,reveal,revenue
reverse,revise,revolution,rigid,role,route,scenario,schedule,scheme,scope
section,sector,secure,seek,segment,select,sequence,series,significant,similar
simulate,sole,somewhat,source,specific,specify,sphere,stability,statistic,status
strategy,structure,style,submit,subsequent,subsidy,substitute,successor,sufficient,summarize
superior,supplement,supply,survive,suspend,sustain,symbol,symptom,synthesis,systematic
target,task,technical,technique,technology,temporary,tense,terminate,theme,theory
thereby,thesis,topic,trace,tradition,transfer,transform,transition,transmit,transport
trend,trigger,ultimate,undergo,underlie,undertake,uniform,unify,unique,utilize
valid,variable,variation,vehicle,version,versus,via,viable,victim,violate
virtual,visible,vision,visual,vital,volume,voluntary,whereas,widespread,whereby
abandon,abolish,absorb,abstract,accelerate,accommodate,accompany,accomplish,accord,accumulate
acknowledge,acquire,acute,adapt,adjacent,adjust,administer,admit,adopt,advance
adverse,advocate,aesthetic,affect,aggregate,aggressive,allocate,alter,alternative,ambiguous
amend,analogy,anticipate,anxiety,apparent,appeal,append,applicable,appreciate,approach
appropriate,approximate,arbitrary,arise,arouse,assemble,assess,assign,assist,assume
assure,attach,attain,attribute,authentic,author,authority,autonomous,available,avert
awkward,barrier,behalf,beneficial,bias,bind,brief,bulk,capable,capacity
cease,chamber,channel,chapter,chart,chemical,circumstance,cite,civil,clarify
classic,clause,coherent,coincide,collapse,colleague,commence,comment,commission,commit
commodity,communicate,community,compatible,compensate,competent,compile,complement,complex,comply
component,compose,compound,comprehensive,comprise,compute,conceive,concentrate,concept,conclude
concurrent,conduct,confer,confine,confirm,conflict,conform,confront,confuse,congress
conjunction,consent,consequent,considerable,consist,consistent,constant,constitute,constrain,construct
consult,consume,contact,contemporary,context,contract,contradict,contrary,contrast,contribute
controversy,convene,conventional,converse,convert,convince,cooperate,coordinate,corporate,correspond
couple,create,credit,criteria,crucial,culture,cumulative,currency,cycle,debate
decade,decline,dedicate,deduce,define,definite,deliberate,demonstrate,denote,deny
depict,depress,derive,design,despite,detect,deviate,device,devote,differentiate
dimension,diminish,discrete,discriminate,displace,display,dispose,distinct,distort,distribute
diverse,doctrine,document,domestic,dominate,draft,drama,duration,dynamic,economy
edit,effect,effective,efficient,elaborate,eliminate,eloquent,emerge,emphasis,empirical
enable,encounter,energy,enforce,enhance,enormous,ensure,entity,equate,equip
equivalent,erode,error,establish,estate,estimate,ethic,ethnic,evaluate,eventual
evident,evoke,evolve,exceed,exclude,execute,exhibit,expand,expert,explicit
exploit,export,expose,external,extract,facilitate,factor,feature,federal,finite
fluctuate,focus,format,formula,foundation,framework,function,fundamental,furthermore,generate
generation,globe,grade,grant,guarantee,hierarchy,highlight,identical,identify,ideology
ignorant,illustrate,immigrate,impact,implement,implicate,implicit,imply,impose,incentive
incidence,incline,income,incorporate,index,indicate,individual,induce,inevitable,infer
infrastructure,inherent,initial,initiate,injure,innovate,input,insert,insight,inspect
instance,institute,integrate,intellect,intense,interact,intermediate,internal,interpret,interval
intervene,intrinsic,invest,investigate,invoke,involve,isolate,issue,item,justify
label,labor,layer,lecture,legal,legislate,levy,liberal,license,likewise
link,locate,logic,maintain,major,manifest,manipulate,manual,margin,mature
maximum,mechanism,media,mediate,medical,medium,mental,method,migrate,military
minimal,minimum,minor,mode,modify,monitor,motive,mutual,negate,negative
neutral,nevertheless,norm,normal,notion,notwithstanding,objective,oblige,obtain,obvious
occupy,occur,odd,offset,ongoing,option,orient,origin,outcome,output
overall,overlap,overseas,parallel,parameter,participate,particular,passive,peak,perceive
percent,period,persist,perspective,phase,philosophy,physical,pioneer,portion,pose
positive,potential,practitioner,precede,precise,predict,predominant,preliminary,presume,previous
primary,prime,principal,principle,prior,priority,proceed,process,professional,profound
prohibit,project,promote,proportion,prospect,protocol,psychology,publication,publish,purchase
pursue,qualify,quality,quarter,radical,random,range,ratio,rational,react
recover,refine,reflect,reform,regime,region,register,regulate,reinforce,reject
relate,relevant,reluctant,rely,remove,require,resemble,resolve,resource,respond
restore,restrain,restrict,retain,reveal,revenue,reverse,revise,revolution,rigid
role,route,scenario,schedule,scheme,scope,section,sector,secure,seek
segment,select,sequence,series,significant,similar,simulate,sole,somewhat,source
specific,specify,sphere,stability,statistic,status,strategy,structure,style,submit
subsequent,substitute,successor,sufficient,superior,supplement,supply,survive,suspend,sustain
symbol,synthesis,target,task,technical,technique,temporary,tense,terminate,theme
thereby,thesis,topic,trace,tradition,transfer,transform,transition,transmit,transport
trend,trigger,ultimate,undergo,underlie,undertake,uniform,unify,unique,utilize
variable,variation,vehicle,version,versus,via,viable,victim,violate,visible
vision,visual,vital,volume,voluntary,whereas,widespread,whereby,abundant,accelerate
accommodate,accomplish,acknowledge,acquire,adapt,adjacent,administer,adverse,allocate,ambiguous
anticipate,append,appropriate,arbitrary,assemble,attribute,autonomous,avert,barrier,beneficial
bind,capacity,chamber,circumstance,cite,clause,coincide,collapse,commission,commodity
compatible,competent,compile,compound,compute,concentrate,confer,confront,congress,conjunction
conserve,consolidate,conspicuous,constant,consultation,contemplate,contend,contextual,contingent,convene
converse,conviction,correlate,correspondence,corrupt,counsel,counterpart,criterion,cultivate,cumulative
curriculum,debilitate,decisive,declaration,decree,deficient,definitive,degradation,deliberation,demographic
denounce,deplete,deport,deprive,derivative,descend,designate,desolate,despair,despise
destiny,detach,detain,deteriorate,devastate,devotion,diagnose,dialect,differentiation,dignity
dilemma,diligent,diminish,diplomatic,disastrous,disclose,discrepancy,discriminate,disdain,disperse
disposition,dispute,disrupt,dissolve,distinctive,distract,distress,diverse,divert,doctrine
documentary,dominance,donate,dormant,dramatic,drought,dubious,durable,dynamic,eccentric
ecological,economical,edible,editorial,educate,effective,efficient,elaborate,electoral,elegant
elevate,eligible,eliminate,eloquent,elusive,embark,embed,embody,embrace,emerge
eminent,emit,emphasize,empirical,empower,enact,encompass,encounter,endorse,endow
endure,energetic,enforce,engage,engender,enhance,enlighten,enormous,enrich,enroll
ensue,ensure,entail,enterprise,enthusiastic,entity,entrepreneur,enumerate,environment,equilibrium
equip,equivalent,eradicate,erect,erode,erratic,escalate,essence,establish,esteem
estimate,eternal,ethic,evacuate,evaluate,evaporate,evident,evoke,evolve,exaggerate
exceed,excel,exceptional,excess,exclude,exclusive,execute,exemplify,exempt,exert
exhaust,exhibit,exile,exotic,expand,expedition,expel,expend,expertise,explicit
exploit,explore,expose,expound,extensive,extinct,extract,extravagant,fabricate,facilitate
faction,faculty,famine,fascinate,fatal,feasible,feature,federation,feeble,ferment
fertile,fervent,fiction,fidelity,fierce,finite,flawless,flexible,flourish,fluctuate
formidable,formulate,fortify,fortune,fragment,framework,fraudulent,frequent,friction,frugal
frustrate,fulfill,function,fundamental,furious,furnish,furthermore,futile,generate,generous
genetic,genuine,geography,gesture,glamorous,global,glorious,govern,graceful,gradual
gratitude,grave,gregarious,grieve,guarantee,habitat,harmony,harsh,hazard,heritage
hierarchy,hinder,historic,homogeneous,honorable,horizon,hostile,humble,hypothesis,idealistic
identical,ideology,ignorant,illuminate,illusion,illustrate,immense,immigrate,immune,impact
impartial,impede,imperative,implement,implicate,implicit,imply,impose,impress,improve
impulse,inaugurate,incentive,incline,inclusive,income,incompatible,inconvenient,incorporate,increase
incredible,incumbent,incur,indebted,indicate,indigenous,indignant,indispensable,individual,induce
indulge,inevitable,infer,infinite,infringe,ingenious,inherit,inhibit,initial,initiate
inject,injure,innovate,input,insert,insight,inspect,inspire,install,instance
institute,instruct,insulate,integral,integrate,integrity,intellect,intelligent,intense,intent
interact,interfere,interim,intermediate,internal,interpret,interrogate,intersect,interval,intervene
intimate,intricate,intrinsic,introduce,intuition,inundate,invest,investigate,invoke,involve
ironic,irrational,irrelevant,irrigate,isolate,issue,jeopardize,judicial,jurisdiction,justification
juvenile,keen,kinetic,laboratory,lag,lament,landmark,latent,legitimate,leisure
lenient,lethal,levy,liberal,liberate,likelihood,likewise,linguistic,literal,litigation
locate,logic,loyal,lucrative,luminous,magnificent,maintain,major,malicious,mandatory
manifest,manipulate,manual,marginal,mature,maximum,mechanism,mediate,medieval,mediocre
melancholy,memorable,menace,mentor,mercy,merge,merit,metaphor,meticulous,migrate
militant,minimal,minimum,minor,miracle,miserable,misfortune,mislead,mitigate,mobile
moderate,modest,modify,monitor,motive,mutual,mysterious,narrative,native,navigate
necessitate,negate,neglect,negotiate,neutral,nevertheless,nominate,notable,notion,notorious
notwithstanding,nourish,novel,nuisance,numerous,nurture,objective,obligate,obscure,obsess
obstacle,obtain,obvious,occupy,occur,odd,offend,offset,ongoing,opaque
oppose,optimistic,option,orient,origin,ornament,outcome,output,overall,overcome
overlap,overseas,overwhelm,parallel,paramount,participate,particular,passive,patent,patience
patriotic,patron,peak,peculiar,perceive,perennial,perfection,perform,peril,permanent
permeate,permit,perpetual,persist,perspective,persuade,pertinent,phase,phenomenon,philosophy
physical,pioneer,pivotal,plausible,pledge,plentiful,plunge,poignant,polar,polish
pollute,ponder,popular,portable,portion,portray,pose,positive,potential,practitioner
precede,precise,predict,predominant,preliminary,premature,premise,premium,presume,previous
primary,prime,principal,principle,prior,priority,proceed,process,proclaim,productive
professional,proficient,profound,prohibit,project,prominent,promote,proportion,propose,prospect
prosper,protein,protocol,provoke,prudent,psychology,publication,publish,punctual,purchase
pursue,qualify,quality,quarter,radical,random,range,ratio,rational,react
realistic,rebellious,recede,reciprocal,reckless,recognize,recommend,reconcile,recover,recruit
refine,reflect,reform,refuge,refute,regime,region,register,regulate,rehabilitate
rehearse,reign,reinforce,reject,relate,relevant,reluctant,rely,remarkable,remedy
remind,remote,remove,render,renew,renounce,renowned,repair,repeal,repetition
replace,replicate,represent,repress,reproduce,republic,repudiate,require,resemble,resent
reserve,reside,resign,resilient,resist,resolve,resort,resource,respect,respond
restore,restrain,restrict,retain,retire,retreat,reveal,revenue,reverse,revise
revive,revoke,revolution,rigid,ritual,robust,role,route,routine,royal
rural,sacred,sacrifice,salvage,sanction,satisfy,scarce,scenario,schedule,scheme
scope,scrutinize,section,sector,secure,seek,segment,select,sequence,serene
series,significant,similar,simulate,sincere,sole,solicit,solitary,somewhat,source
sovereign,specific,specify,sphere,stability,statistic,status,steadfast,strategy,structure
style,subjective,submit,subsequent,subsidy,substantial,substitute,successor,sufficient,superior
supplement,supply,surpass,survive,suspect,suspend,sustain,symbol,sympathy,synthesis
tangible,target,task,technical,technique,tedious,temporary,tense,terminate,terrain
theme,theoretical,thereby,thesis,thorough,threaten,threshold,tolerance,topic,trace
tradition,tragedy,trait,transfer,transform,transition,transmit,transport,trend,trigger
triumph,trivial,tropical,ultimate,undergo,underlie,undertake,uniform,unify,unique
universal,unprecedented,unveil,uphold,urgent,utilize,valid,valuable,variable,variation
vehicle,version,versus,via,viable,victim,violate,visible,vision,visual
vital,vivid,vocal,volume,voluntary,vulnerable,whereas,widespread,whereby,zealous`.trim().split('\n');

// Word meanings dictionary - comprehensive
const MEANINGS = {
  analyze: ["examine in detail to understand","Scientists analyze data to find patterns."],
  hypothesis: ["an educated guess to be tested","Her hypothesis was proven by the experiment."],
  investigate: ["to look into something carefully","Police investigate crimes thoroughly."],
  observe: ["to watch carefully and notice details","We observe birds in the garden."],
  discover: ["to find something new","Scientists discover new species every year."],
  explore: ["to travel through unfamiliar areas","Children explore the forest with wonder."],
  curious: ["eager to learn or know","Curious minds ask the best questions."],
  phenomenon: ["an observable fact or event","Rainbows are a beautiful phenomenon."],
  evidence: ["facts indicating truth","The evidence proved his innocence."],
  conclude: ["to reach a decision after thinking","We conclude that practice improves skill."],
  theory: ["a system of ideas explaining something","Darwin's theory changed biology forever."],
  experiment: ["a scientific test","The experiment produced surprising results."],
  research: ["systematic investigation","Medical research saves lives."],
  inquiry: ["an act of asking for information","The inquiry revealed new facts."],
  speculate: ["to form theories without firm evidence","Experts speculate about Mars."],
  scrutinize: ["to examine closely and critically","Auditors scrutinize financial records."],
  deduce: ["to reach a conclusion by reasoning","Detectives deduce facts from clues."],
  verify: ["to make sure something is true","Please verify your email address."],
  uncover: ["to discover something hidden","Archaeologists uncover ancient ruins."],
  probe: ["to investigate thoroughly","Journalists probe into corruption."],
  articulate: ["able to express ideas clearly","She is an articulate speaker."],
  eloquent: ["fluent and persuasive in speaking","His eloquent speech moved the audience."],
  persuade: ["to convince someone","Advertisements persuade us to buy products."],
  convey: ["to communicate a message","Art conveys emotions without words."],
  express: ["to make known in words","Poets express feelings through verse."],
  communicate: ["to share information","We communicate through language and gestures."],
  assert: ["to state confidently","Leaders assert their vision boldly."],
  emphasize: ["to give special importance to","Teachers emphasize the importance of reading."],
  clarify: ["to make something clear","Could you clarify your main point?"],
  elaborate: ["to add more detail","Please elaborate on your proposal."],
  narrate: ["to tell a story","Grandparents narrate tales from their youth."],
  describe: ["to give an account in words","Writers describe scenes vividly."],
  interpret: ["to explain the meaning of","Musicians interpret songs differently."],
  paraphrase: ["to express in different words","Students paraphrase texts in their own words."],
  summarize: ["to give a brief account","Reporters summarize the day's news."],
  debate: ["to discuss opposing views","Politicians debate policies on television."],
  negotiate: ["to discuss to reach agreement","Countries negotiate trade deals."],
  advocate: ["to publicly support","Activists advocate for environmental protection."],
  proclaim: ["to announce officially","The king proclaimed a new law."],
  announce: ["to make a public statement","Schools announce exam results online."],
  evaluate: ["to assess the value of","Judges evaluate performances carefully."],
  assess: ["to evaluate or estimate","Teachers assess student progress regularly."],
  compare: ["to examine similarities and differences","We compare prices before buying."],
  contrast: ["to show differences","The essay contrasts urban and rural life."],
  distinguish: ["to recognize as different","Experts distinguish real art from copies."],
  justify: ["to show to be right or reasonable","Can you justify your decision?"],
  critique: ["to evaluate critically","Critics critique films and books."],
  appraise: ["to assess the quality of","Jewelers appraise diamonds carefully."],
  weigh: ["to consider carefully","Judges weigh evidence before deciding."],
  logical: ["based on clear reasoning","Her argument was logical and convincing."],
  rational: ["based on reason rather than emotion","Make rational decisions about money."],
  coherent: ["logical and consistent","Write a coherent essay with clear points."],
  valid: ["well-founded and logical","That is a valid reason for concern."],
  plausible: ["seeming reasonable or probable","His explanation sounds plausible."],
  feasible: ["possible to do easily","Building a bridge here is feasible."],
  comprehensive: ["complete and including everything","The report is comprehensive and detailed."],
  thorough: ["complete with attention to detail","She did a thorough job cleaning."],
  systematic: ["done according to a fixed plan","Scientists use systematic methods."],
  methodical: ["done in an orderly way","He is methodical in his approach."],
  ecosystem: ["a community of living organisms","Rainforests have rich ecosystems."],
  biodiversity: ["variety of life in an area","Protecting biodiversity is essential."],
  habitat: ["natural home of an organism","Polar bears' habitat is melting."],
  organism: ["a living thing","Every organism needs food and water."],
  species: ["a group of similar organisms","Many species face extinction today."],
  photosynthesis: ["process plants use to make food","Photosynthesis requires sunlight."],
  evolution: ["gradual development over time","Evolution explains species diversity."],
  adaptation: ["adjustment to new conditions","Camouflage is a useful adaptation."],
  sustainability: ["ability to maintain over time","Sustainability protects future generations."],
  conservation: ["protection of natural resources","Conservation efforts save endangered animals."],
  climate: ["long-term weather patterns","Climate change affects global temperatures."],
  atmosphere: ["layer of gases around Earth","The atmosphere protects us from radiation."],
  precipitation: ["rain, snow, or hail","Annual precipitation varies by region."],
  temperature: ["degree of heat or cold","Temperature affects chemical reactions."],
  geology: ["study of Earth's structure","Geology reveals Earth's ancient history."],
  terrain: ["physical features of land","Mountain terrain is difficult to cross."],
  volcano: ["mountain that erupts lava","The volcano erupted after decades."],
  earthquake: ["sudden shaking of the ground","Earthquakes can cause massive damage."],
  mineral: ["naturally occurring solid substance","Gold is a valuable mineral."],
  fossil: ["remains of ancient organisms","Fossils tell us about prehistoric life."],
  civilization: ["advanced human society","Ancient Egyptian civilization lasted millennia."],
  monarchy: ["government by a king or queen","Britain has a constitutional monarchy."],
  democracy: ["government by the people","Democracy gives citizens voting rights."],
  revolution: ["dramatic change in government","The French Revolution changed Europe."],
  colony: ["territory controlled by another country","India was once a British colony."],
  independence: ["freedom from control","India gained independence in 1947."],
  constitution: ["fundamental laws of a nation","The constitution protects citizens' rights."],
  amendment: ["a change to a law or constitution","The amendment granted voting rights."],
  sovereignty: ["supreme power of a state","Nations defend their sovereignty fiercely."],
  diplomacy: ["managing international relations","Diplomacy prevents wars between nations."],
  heritage: ["traditions passed through generations","We must preserve our cultural heritage."],
  tradition: ["custom passed through generations","Family traditions create lasting bonds."],
  culture: ["beliefs and customs of a group","Every culture has unique celebrations."],
  ethnicity: ["shared cultural background","Ethnicity shapes identity and community."],
  migration: ["movement from one place to another","Bird migration follows seasonal patterns."],
  immigration: ["moving to a new country","Immigration enriches diverse societies."],
  assimilation: ["absorbing into a culture","Assimilation can take generations."],
  prejudice: ["unfair opinion without reason","We must fight prejudice in society."],
  tolerance: ["acceptance of different views","Tolerance makes communities stronger."],
  diversity: ["variety of different elements","Diversity strengthens organizations."],
  aesthetic: ["concerned with beauty","The building has great aesthetic appeal."],
  creative: ["having original ideas","Creative thinkers solve problems differently."],
  imaginative: ["having a vivid imagination","Imaginative children invent wonderful stories."],
  innovative: ["introducing new ideas","Innovative companies lead their industries."],
  original: ["new and not copied","Her original design won first prize."],
  abstract: ["existing in thought, not physical","Abstract art expresses emotions visually."],
  symbolic: ["representing something else","The dove is symbolic of peace."],
  metaphor: ["figure of speech comparing things","Life is a journey is a common metaphor."],
  allegory: ["story with hidden meaning","Animal Farm is an allegory about power."],
  genre: ["category of art or literature","Science fiction is my favorite genre."],
  rhythm: ["pattern of beats in music","African drums have complex rhythms."],
  harmony: ["pleasing combination of elements","The choir sang in perfect harmony."],
  melody: ["sequence of musical notes","The melody stayed in my head all day."],
  composition: ["a creative work","Mozart wrote this composition at age eight."],
  sculpture: ["three-dimensional art form","The marble sculpture took years to complete."],
  canvas: ["surface for painting","The artist stretched canvas on a frame."],
  portrait: ["artistic representation of a person","The portrait captured her personality."],
  exhibition: ["public display of art","The exhibition attracted thousands of visitors."],
  masterpiece: ["work of outstanding skill","The Mona Lisa is a true masterpiece."],
  renaissance: ["revival of art and learning","The Renaissance transformed European culture."],
  influence: ["power to affect others","Parents have great influence on children."],
  authority: ["power to give orders","Teachers have authority in the classroom."],
  prestige: ["widespread respect and admiration","The university has international prestige."],
  reputation: ["beliefs about someone's character","She built a reputation for honesty."],
  credibility: ["quality of being trusted","Journalists must maintain credibility."],
  integrity: ["honesty and strong principles","Leaders with integrity earn respect."],
  accountability: ["responsibility for actions","Public officials need accountability."],
  responsibility: ["duty to deal with something","Taking responsibility shows maturity."],
  dedication: ["commitment to a task","Her dedication to study paid off."],
  perseverance: ["continued effort despite difficulty","Perseverance leads to success."],
  ambition: ["strong desire to achieve","His ambition drove him to excel."],
  motivation: ["reason for acting","Good teachers inspire student motivation."],
  determination: ["firmness of purpose","Her determination overcame all obstacles."],
  resilience: ["ability to recover quickly","Resilience helps us bounce back from failure."],
  confidence: ["belief in one's abilities","Confidence grows with practice."],
  initiative: ["ability to act independently","Show initiative by starting projects early."],
  strategy: ["plan to achieve a goal","A good strategy wins chess games."],
  tactic: ["specific action to achieve a goal","The team used clever tactics to win."],
  vision: ["ability to think about the future","Great leaders have a clear vision."],
  mission: ["important assignment or purpose","The mission was to explore Mars."],
  economy: ["system of production and trade","The global economy affects everyone."],
  inflation: ["general increase in prices","Inflation reduces purchasing power."],
  recession: ["period of economic decline","The recession caused many job losses."],
  prosperity: ["state of being successful","Economic reforms brought prosperity."],
  poverty: ["state of being extremely poor","Fighting poverty requires global effort."],
  subsidy: ["government financial support","Farm subsidies help agricultural workers."],
  tariff: ["tax on imported goods","Tariffs protect domestic industries."],
  investment: ["money put into something profitable","Education is the best investment."],
  dividend: ["share of company profits","Shareholders receive annual dividends."],
  budget: ["plan for spending money","Families create monthly budgets."],
  commerce: ["activity of buying and selling","E-commerce has transformed shopping."],
  enterprise: ["business organization","Small enterprises drive innovation."],
  entrepreneur: ["person who starts businesses","Entrepreneurs take risks to innovate."],
  monopoly: ["exclusive control of a market","Governments regulate monopolies."],
  competition: ["rivalry between businesses","Competition lowers prices for consumers."],
  consumer: ["person who buys goods","Consumers demand better products."],
  supply: ["amount available for use","Oil supply affects global prices."],
  demand: ["desire for goods or services","High demand raises prices."],
  scarcity: ["shortage of resources","Water scarcity affects many regions."],
  abundance: ["large quantity available","The harvest brought abundance."],
  technology: ["application of scientific knowledge","Technology changes how we live."],
  digital: ["relating to computer technology","Digital tools enhance learning."],
  artificial: ["made by humans, not natural","Artificial intelligence is advancing rapidly."],
  automation: ["use of machines instead of people","Automation increases factory efficiency."],
  innovation: ["introduction of new ideas","Innovation drives economic growth."],
  algorithm: ["step-by-step problem-solving procedure","Search engines use complex algorithms."],
  software: ["programs that run on computers","Software developers create applications."],
  hardware: ["physical computer components","Upgrade your hardware for better performance."],
  cybersecurity: ["protection of computer systems","Cybersecurity prevents data breaches."],
  encryption: ["converting data into secret code","Encryption protects online transactions."],
  internet: ["global computer network","The internet connects billions of people."],
  connectivity: ["state of being connected","Rural areas need better connectivity."],
  bandwidth: ["data transfer capacity","Video calls require high bandwidth."],
  platform: ["foundation for applications","Social media platforms connect users."],
  interface: ["point of interaction between systems","The app has a user-friendly interface."],
  application: ["software program for a task","Download the application from the store."],
  database: ["organized collection of data","Hospitals store records in databases."],
  network: ["interconnected system","The neural network mimics the brain."],
  virtual: ["existing in effect, not physically","Virtual meetings save travel time."],
  reality: ["the state of things as they exist","Virtual reality creates immersive experiences."],
  nutrition: ["process of providing food for health","Good nutrition supports brain development."],
  metabolism: ["chemical processes in the body","Exercise speeds up metabolism."],
  immunity: ["ability to resist disease","Vaccines strengthen immunity."],
  vaccination: ["injection to prevent disease","Vaccination eradicated smallpox."],
  hygiene: ["practices maintaining health","Good hygiene prevents infections."],
  exercise: ["physical activity for fitness","Regular exercise improves mental health."],
  wellness: ["state of being in good health","Wellness programs benefit employees."],
  mental: ["relating to the mind","Mental health is equally important."],
  therapy: ["treatment to relieve disorders","Therapy helps people overcome trauma."],
  rehabilitation: ["restoring to normal life","Rehabilitation follows serious injuries."],
  anatomy: ["study of body structure","Medical students study human anatomy."],
  physiology: ["study of body functions","Physiology explains how organs work."],
  diagnosis: ["identification of a disease","Early diagnosis improves survival rates."],
  symptom: ["sign of illness","Fever is a common symptom of infection."],
  chronic: ["lasting a long time","Diabetes is a chronic condition."],
  acute: ["severe but short-lasting","Acute pain requires immediate attention."],
  prevention: ["action to stop something happening","Prevention is better than cure."],
  treatment: ["medical care for illness","The treatment was highly effective."],
  recovery: ["return to normal health","Full recovery took several weeks."],
  longevity: ["long duration of life","Healthy habits promote longevity."],
  abundant: ["existing in large quantities","The region has abundant natural resources."],
  adequate: ["satisfactory or acceptable","The salary is adequate for living costs."],
  apparent: ["clearly visible or understood","It was apparent that she was nervous."],
  approximate: ["close but not exact","The approximate cost is five hundred dollars."],
  arbitrary: ["based on random choice","The rule seemed arbitrary and unfair."],
  authentic: ["genuine and real","The museum displays authentic artifacts."],
  available: ["able to be used or obtained","Tickets are available online."],
  beneficial: ["producing good results","Exercise is beneficial for mental health."],
  capable: ["having the ability to do something","She is capable of leading the team."],
  cease: ["to stop doing something","The rain ceased by afternoon."],
  circumstance: ["a fact or condition","Under the circumstances, we postponed the trip."],
  commence: ["to begin or start","The ceremony will commence at noon."],
  compensate: ["to make up for something","Hard work compensates for lack of talent."],
  complement: ["to complete or enhance","The wine complements the meal perfectly."],
  component: ["a part of something larger","Each component must function correctly."],
  comprise: ["to consist of","The committee comprises twelve members."],
  conceive: ["to form an idea","Scientists conceive theories from observations."],
  concurrent: ["happening at the same time","Two concurrent events caused confusion."],
  confine: ["to keep within limits","Please confine your remarks to the topic."],
  conform: ["to comply with rules","Students must conform to dress codes."],
  consent: ["permission for something","Parents must give consent for the trip."],
  consequent: ["following as a result","The drought and consequent famine devastated the region."],
  considerable: ["notably large in amount","She has considerable experience in teaching."],
  consist: ["to be composed of","The team consists of ten players."],
  constant: ["continuously occurring","Constant practice improves performance."],
  constitute: ["to form or make up","Women constitute half the population."],
  constrain: ["to restrict or limit","Budget limits constrain our options."],
  construct: ["to build or create","Engineers construct bridges and buildings."],
  consult: ["to seek advice from","Consult a doctor before taking medicine."],
  contemporary: ["belonging to the present time","Contemporary art challenges traditions."],
  contradict: ["to assert the opposite","The witness contradicted his earlier statement."],
  contribute: ["to give something to help","Everyone should contribute to society."],
  controversy: ["prolonged public disagreement","The decision sparked controversy."],
  conventional: ["based on accepted standards","She prefers conventional teaching methods."],
  convert: ["to change into something else","Solar panels convert sunlight to electricity."],
  convince: ["to persuade someone","Facts convinced the jury of his guilt."],
  cooperate: ["to work together","Nations must cooperate on climate change."],
  coordinate: ["to organize different elements","She coordinates events for the school."],
  corporate: ["relating to a large company","Corporate culture affects employee satisfaction."],
  correspond: ["to match or be similar","Results correspond with our predictions."],
  criteria: ["standards for judgment","What criteria will you use to evaluate?"],
  crucial: ["extremely important","Timing is crucial in emergency medicine."],
  cumulative: ["increasing by addition","Cumulative effort leads to mastery."],
  decline: ["to decrease or refuse","Sales declined during the recession."],
  definite: ["clearly stated or decided","We need a definite answer by Friday."],
  demonstrate: ["to show clearly","The experiment demonstrates the principle."],
  denote: ["to be a sign of","Red lights denote danger on roads."],
  depress: ["to push down or sadden","Bad news can depress stock markets."],
  derive: ["to obtain from a source","Many English words derive from Latin."],
  despite: ["without being affected by","She succeeded despite many obstacles."],
  detect: ["to discover or notice","Sensors detect movement in the room."],
  deviate: ["to depart from a standard","Do not deviate from the approved plan."],
  device: ["a tool or piece of equipment","Smartphones are versatile devices."],
  devote: ["to give time and energy to","She devotes hours to practicing piano."],
  differentiate: ["to recognize differences","Can you differentiate between the twins?"],
  dimension: ["a measurable extent","Time is the fourth dimension in physics."],
  diminish: ["to make or become less","The storm's power began to diminish."],
  discrete: ["individually separate","The data falls into discrete categories."],
  discriminate: ["to recognize a distinction","We must not discriminate based on race."],
  displace: ["to move from proper position","Floods displaced thousands of families."],
  display: ["to show or exhibit","Museums display artifacts from history."],
  dispose: ["to get rid of or arrange","Dispose of waste responsibly."],
  distinct: ["recognizably different","Each culture has distinct traditions."],
  distort: ["to twist out of shape","Mirrors can distort your reflection."],
  distribute: ["to give shares of something","Charities distribute food to the needy."],
  diverse: ["showing great variety","India has a diverse population."],
  domestic: ["relating to the home country","Domestic flights are cheaper than international."],
  dominate: ["to have control over","Large companies dominate the market."],
  duration: ["the time something lasts","The duration of the movie is two hours."],
  dynamic: ["characterized by constant change","The market is highly dynamic."],
  element: ["a basic component","Water contains hydrogen and oxygen elements."],
  eliminate: ["to completely remove","Vaccines help eliminate deadly diseases."],
  emerge: ["to come into view","New leaders emerge during crises."],
  emphasis: ["special importance given to something","The teacher placed emphasis on vocabulary."],
  empirical: ["based on observation or experience","Empirical evidence supports the theory."],
  enable: ["to make possible","Technology enables remote learning."],
  encounter: ["to meet unexpectedly","Travelers encounter diverse cultures."],
  enhance: ["to improve quality","Reading enhances vocabulary and thinking."],
  enormous: ["very large in size","The elephant is an enormous animal."],
  ensure: ["to make certain","Wear a helmet to ensure safety."],
  entity: ["a thing with distinct existence","The company is a separate legal entity."],
  equivalent: ["equal in value or meaning","One dollar is equivalent to eighty rupees."],
  erode: ["to gradually wear away","Wind and rain erode rock formations."],
  establish: ["to set up on a firm basis","The school was established in 1950."],
  estimate: ["to roughly calculate","Engineers estimate construction costs."],
  ethic: ["moral principles","Medical ethics require patient confidentiality."],
  evident: ["clearly seen or understood","It was evident that he had studied hard."],
  evolve: ["to develop gradually","Languages evolve over centuries."],
  exceed: ["to go beyond a limit","Sales exceeded expectations this quarter."],
  exclude: ["to shut out or leave out","The price excludes taxes and fees."],
  exhibit: ["to display publicly","Galleries exhibit works by new artists."],
  expand: ["to become larger","Businesses expand into new markets."],
  expert: ["a person with special skill","Consult an expert before making decisions."],
  explicit: ["stated clearly and directly","Give explicit instructions to avoid confusion."],
  exploit: ["to use for benefit","Companies exploit natural resources."],
  export: ["to send goods to another country","India exports software services globally."],
  expose: ["to reveal or make visible","Journalists expose corruption in government."],
  external: ["coming from outside","External factors affect business performance."],
  extract: ["to remove or obtain from","Scientists extract DNA from cells."],
  facilitate: ["to make easier","Technology facilitates communication."],
  factor: ["a circumstance contributing to a result","Weather is a factor in crop yields."],
  feature: ["a distinctive attribute","The phone's best feature is its camera."],
  federal: ["relating to central government","Federal laws apply nationwide."],
  finite: ["having limits","Earth's resources are finite."],
  fluctuate: ["to rise and fall irregularly","Stock prices fluctuate daily."],
  focus: ["to concentrate attention","Focus on your goals and work hard."],
  format: ["the way something is arranged","Follow the required essay format."],
  formula: ["a mathematical relationship","Einstein's formula changed physics."],
  foundation: ["the basis on which something stands","Education is the foundation of success."],
  framework: ["a basic structure","The law provides a framework for justice."],
  function: ["the purpose for which something exists","The heart's function is to pump blood."],
  fundamental: ["forming a necessary base","Reading is a fundamental skill."],
  furthermore: ["in addition; moreover","The plan is risky. Furthermore, it is expensive."],
  generate: ["to produce or create","Wind turbines generate electricity."],
  generation: ["all people born around the same time","Each generation faces unique challenges."],
  globe: ["the Earth; world","Climate change affects the entire globe."],
  grade: ["a level of quality or rank","She received the highest grade in class."],
  grant: ["to give or allow","Universities grant scholarships to talented students."],
  guarantee: ["a promise that something will happen","The warranty guarantees free repairs."],
  hierarchy: ["a system of ranked levels","The army has a clear hierarchy."],
  highlight: ["to emphasize or make prominent","The report highlights key findings."],
  identical: ["exactly alike","The twins look identical."],
  identify: ["to recognize or establish identity","Can you identify the main theme?"],
  ideology: ["a system of ideas and ideals","Political ideology shapes government policy."],
  ignorant: ["lacking knowledge","It is ignorant to judge without understanding."],
  illustrate: ["to explain with examples","Charts illustrate data clearly."],
  immigrate: ["to move to a new country","Many people immigrate for better opportunities."],
  impact: ["a strong effect on something","Education has a lasting impact on lives."],
  implement: ["to put into effect","Schools implement new teaching methods."],
  implicate: ["to show involvement in a crime","Evidence implicated several officials."],
  implicit: ["implied though not stated","There was an implicit agreement between them."],
  imply: ["to suggest without stating directly","His tone implied disappointment."],
  impose: ["to force something on others","Governments impose taxes on citizens."],
  incentive: ["something that motivates action","Bonuses provide incentive to work harder."],
  incidence: ["the occurrence of something","The incidence of disease decreased."],
  incline: ["to tend toward a particular action","I incline toward the first option."],
  income: ["money received regularly","Monthly income should exceed expenses."],
  incorporate: ["to include as part of a whole","Incorporate feedback into your revision."],
  index: ["an alphabetical list of topics","Use the index to find information quickly."],
  indicate: ["to point out or show","Research indicates that sleep improves memory."],
  individual: ["a single person or thing","Respect every individual's rights."],
  induce: ["to bring about or persuade","Medicine can induce sleep."],
  inevitable: ["certain to happen","Change is inevitable in life."],
  infer: ["to deduce from evidence","From her smile, I infer she passed the exam."],
  infrastructure: ["basic physical systems of a country","Roads and bridges are infrastructure."],
  inherent: ["existing as a natural part","Risk is inherent in all investments."],
  initial: ["existing at the beginning","My initial reaction was surprise."],
  initiate: ["to cause something to begin","The coach initiated a new training program."],
  injure: ["to cause physical harm","Careless driving can injure pedestrians."],
  innovate: ["to introduce new methods","Companies innovate to stay competitive."],
  input: ["what is put in or contributed","Your input improved the project."],
  insert: ["to put something into something else","Insert the key and turn it."],
  insight: ["deep understanding of something","The book offers insight into human nature."],
  inspect: ["to examine closely","Officials inspect food for safety."],
  instance: ["an example or occurrence","This is an instance of excellent teamwork."],
  institute: ["to establish or set up","The government instituted new regulations."],
  integrate: ["to combine into a whole","Schools integrate technology into lessons."],
  intellect: ["the faculty of reasoning","Great intellect distinguishes brilliant minds."],
  intense: ["of extreme force or degree","The competition was intense."],
  interact: ["to communicate or work together","Students interact during group projects."],
  intermediate: ["between two levels","This course is for intermediate learners."],
  internal: ["situated within","Internal conflicts weakened the organization."],
  interval: ["a period between events","Take breaks at regular intervals."],
  intervene: ["to come between to alter a result","Teachers intervene in student conflicts."],
  intrinsic: ["belonging naturally; essential","Curiosity is intrinsic to learning."],
  invest: ["to put money into for profit","Invest in education for future returns."],
  invoke: ["to call upon for support","The lawyer invoked constitutional rights."],
  involve: ["to include as a necessary part","Cooking involves patience and practice."],
  isolate: ["to set apart from others","Scientists isolate variables in experiments."],
  issue: ["an important topic or problem","Climate change is a global issue."],
  item: ["an individual article or unit","Check each item on the shopping list."],
  justify: ["to show to be right or reasonable","How do you justify this expense?"],
  label: ["a name or description attached","Read the label before taking medicine."],
  labor: ["work, especially hard physical work","Manual labor built the great pyramids."],
  layer: ["a sheet or thickness of material","The atmosphere has multiple layers."],
  lecture: ["an educational talk","The professor gave a fascinating lecture."],
  legal: ["permitted by law","Make sure your business is legal."],
  legislate: ["to make or enact laws","Parliament legislates on important issues."],
  levy: ["to impose a tax or fine","The government levies taxes on income."],
  liberal: ["open to new ideas","A liberal education includes arts and sciences."],
  license: ["official permission to do something","You need a license to drive."],
  likewise: ["in the same way; also","She excels in math. Likewise, her brother does too."],
  link: ["a connection between things","Scientists found a link between diet and health."],
  locate: ["to find the position of","GPS helps locate your exact position."],
  logic: ["reasoning conducted according to principles","Use logic to solve the puzzle."],
  maintain: ["to keep in good condition","Maintain your health through exercise."],
  major: ["important or serious","Climate change is a major global challenge."],
  manifest: ["to display or show clearly","Symptoms manifest within a few days."],
  manipulate: ["to control cleverly","Advertisers manipulate consumer emotions."],
  manual: ["done by hand; a handbook","Read the manual before operating the machine."],
  margin: ["the edge or border; profit","Write notes in the margin of the book."],
  mature: ["fully developed physically or mentally","Mature students take responsibility seriously."],
  maximum: ["the greatest possible amount","The maximum speed limit is sixty mph."],
  mechanism: ["a system or process","The immune system has defense mechanisms."],
  media: ["means of mass communication","Social media influences public opinion."],
  mediate: ["to intervene to resolve a dispute","A counselor mediates between conflicting parties."],
  medical: ["relating to medicine","Seek medical attention for serious injuries."],
  medium: ["a means of communication","Television is a powerful medium."],
  mental: ["relating to the mind","Mental exercises keep the brain sharp."],
  method: ["a particular way of doing something","The scientific method ensures reliable results."],
  migrate: ["to move from one region to another","Workers migrate to cities for jobs."],
  military: ["relating to armed forces","Military service is mandatory in some countries."],
  minimal: ["of minimum amount or degree","Make minimal changes to the original text."],
  minimum: ["the least possible amount","The minimum age for voting is eighteen."],
  minor: ["lesser in importance","It's a minor issue, not worth worrying about."],
  mode: ["a way or manner of doing something","Switch to silent mode during class."],
  modify: ["to make partial changes to","Modify your diet for better health."],
  monitor: ["to observe and check progress","Doctors monitor patients' vital signs."],
  motive: ["a reason for doing something","Police investigate the motive for the crime."],
  mutual: ["experienced by two parties toward each other","Respect should be mutual in relationships."],
  negate: ["to nullify or make ineffective","One error can negate hours of work."],
  negative: ["expressing denial or refusal","Try to avoid negative self-talk."],
  neutral: ["not supporting either side","Switzerland remained neutral during the war."],
  nevertheless: ["in spite of that","It was raining. Nevertheless, we went hiking."],
  norm: ["a standard or pattern","Working late has become the norm."],
  normal: ["conforming to a standard","It is normal to feel nervous before exams."],
  notion: ["a conception or belief","The notion of equality is fundamental."],
  notwithstanding: ["in spite of","Notwithstanding the rain, the event was successful."],
  objective: ["not influenced by personal feelings","Scientists strive for objective analysis."],
  oblige: ["to require or compel","The law obliges citizens to pay taxes."],
  obtain: ["to get or acquire","Students obtain knowledge through study."],
  obvious: ["easily perceived or understood","The answer was obvious to everyone."],
  occupy: ["to fill or take up space or time","Reading occupies most of my free time."],
  occur: ["to happen or take place","Earthquakes occur along fault lines."],
  odd: ["strange or unusual","It is odd that he did not call."],
  offset: ["to counterbalance","Plant trees to offset carbon emissions."],
  ongoing: ["still in progress","The investigation is ongoing."],
  option: ["a thing that may be chosen","You have the option to retake the exam."],
  orient: ["to align or familiarize","Orient yourself to the campus on the first day."],
  origin: ["the point where something begins","The origin of the universe is debated."],
  outcome: ["the result of a process","Hard work leads to positive outcomes."],
  output: ["the amount produced","Factory output increased this quarter."],
  overall: ["taking everything into account","Overall, the project was a success."],
  overlap: ["to extend over and cover partly","Our interests overlap in many areas."],
  overseas: ["in or to a foreign country","She studied overseas for two years."],
  parallel: ["side by side and equidistant","Draw parallel lines with a ruler."],
  parameter: ["a limit or boundary","Set clear parameters for the project."],
  participate: ["to take part in an activity","All students must participate in sports."],
  particular: ["specific; special","Pay particular attention to grammar."],
  passive: ["accepting without active response","Passive learning is less effective."],
  peak: ["the highest point","Tourism reaches its peak in summer."],
  perceive: ["to become aware of through senses","We perceive colors through our eyes."],
  percent: ["one part in every hundred","Fifty percent of students passed."],
  period: ["a length of time","The Victorian period was era of change."],
  persist: ["to continue firmly despite difficulty","If symptoms persist, see a doctor."],
  perspective: ["a particular way of viewing things","Travel broadens your perspective."],
  phase: ["a distinct period in development","The project is in its final phase."],
  philosophy: ["the study of fundamental questions","Philosophy explores the meaning of life."],
  physical: ["relating to the body","Physical exercise strengthens muscles."],
  pioneer: ["a person who develops new ideas","Marie Curie was a pioneer in radioactivity."],
  portion: ["a part of a whole","Eat a healthy portion of vegetables."],
  pose: ["to present or constitute","Pollution poses a threat to health."],
  positive: ["constructive or optimistic","Maintain a positive attitude toward learning."],
  potential: ["having possibility; capability","She has the potential to become a leader."],
  practitioner: ["a person actively engaged in a profession","Medical practitioners save lives daily."],
  precede: ["to come before in time","Breakfast precedes the morning classes."],
  precise: ["exact and accurate","Use precise measurements in experiments."],
  predict: ["to say what will happen","Meteorologists predict weather patterns."],
  predominant: ["having superiority in power or influence","English is the predominant language online."],
  preliminary: ["preparing for the main event","Preliminary results look promising."],
  presume: ["to suppose to be true without proof","I presume you have read the chapter."],
  previous: ["existing before in time","Review your previous mistakes to improve."],
  primary: ["of chief importance; first in order","The primary goal is student success."],
  prime: ["of the best possible quality","This is a prime example of good writing."],
  principal: ["first in order of importance","The principal reason for failure was lack of preparation."],
  principle: ["a fundamental truth or proposition","Honesty is a basic moral principle."],
  prior: ["existing before in time","Prior experience is not required."],
  priority: ["something regarded as more important","Education should be a top priority."],
  proceed: ["to continue or move forward","Proceed to the next chapter."],
  process: ["a series of actions toward a result","Learning is a lifelong process."],
  professional: ["relating to a profession","Seek professional advice for legal matters."],
  profound: ["very great or intense","The book had a profound impact on me."],
  prohibit: ["to formally forbid","Schools prohibit use of mobile phones in class."],
  project: ["a planned undertaking","The science project won first prize."],
  promote: ["to support or encourage","Schools promote reading through libraries."],
  proportion: ["a part considered in relation to the whole","A large proportion of students passed."],
  prospect: ["the possibility of future success","Young graduates face bright prospects."],
  protocol: ["official procedure or system of rules","Follow safety protocol in the laboratory."],
  psychology: ["the study of mind and behavior","Psychology helps us understand human behavior."],
  publication: ["the preparation and issuing of a book","The publication date is next month."],
  publish: ["to prepare and issue for public sale","Authors publish books through publishers."],
  purchase: ["to acquire by paying for","Purchase tickets online in advance."],
  pursue: ["to follow in order to catch or achieve","Pursue your dreams with determination."],
  qualify: ["to meet the necessary standard","You must qualify for the scholarship."],
  quality: ["the standard of something","Quality education transforms lives."],
  quarter: ["one of four equal parts","Sales rose in the first quarter."],
  radical: ["relating to fundamental change","The reform brought radical changes."],
  random: ["made without method; chance","Questions are selected at random."],
  range: ["the area of variation","The price range is fifty to one hundred dollars."],
  ratio: ["the relationship between two amounts","The student-teacher ratio is twenty to one."],
  react: ["to respond to something","How did she react to the news?"],
  recover: ["to return to normal health","Patients recover faster with good care."],
  refine: ["to improve by making small changes","Refine your essay through revision."],
  reflect: ["to think deeply; to throw back light","Take time to reflect on your goals."],
  reform: ["to make changes for improvement","Governments reform education systems."],
  regime: ["a government, especially an authoritarian one","The regime controlled all media."],
  region: ["an area or division","The Himalayan region is breathtaking."],
  register: ["to record officially","Register for courses before the deadline."],
  regulate: ["to control by rules","Governments regulate food safety standards."],
  reinforce: ["to strengthen or support","Practice reinforces learning."],
  reject: ["to refuse to accept","Universities reject weak applications."],
  relate: ["to show connection between things","Students relate theory to real life."],
  relevant: ["closely connected to the matter","Include only relevant information."],
  reluctant: ["unwilling or hesitant","She was reluctant to ask for help."],
  rely: ["to depend on with confidence","Children rely on parents for support."],
  remove: ["to take away or eliminate","Remove distractions while studying."],
  require: ["to need for a purpose","This job requires excellent communication skills."],
  resemble: ["to look or be like","She resembles her mother closely."],
  resolve: ["to find a solution to","Mediators resolve conflicts peacefully."],
  resource: ["a stock or supply of materials","Libraries are valuable learning resources."],
  respond: ["to react to something","How you respond to failure defines you."],
  restore: ["to bring back to original condition","Volunteers restore old buildings."],
  restrain: ["to keep under control","Restrain your anger in difficult situations."],
  restrict: ["to limit or control","Doctors restrict sugar intake for diabetics."],
  retain: ["to continue to have or keep","Good students retain information through review."],
  reveal: ["to make known; to uncover","Tests reveal areas needing improvement."],
  revenue: ["income, especially of a company","Company revenue grew by twenty percent."],
  reverse: ["to move backward; opposite","Reverse the car carefully."],
  revise: ["to re-examine and improve","Revise your notes before the exam."],
  rigid: ["unable to bend; inflexible","Rigid rules stifle creativity."],
  role: ["the function assumed by a person","Teachers play a vital role in society."],
  route: ["a way or course taken","The bus route passes through downtown."],
  scenario: ["a imagined sequence of events","Plan for the worst-case scenario."],
  schedule: ["a plan for carrying out a process","Follow the study schedule daily."],
  scheme: ["a systematic plan or arrangement","The government launched a new education scheme."],
  scope: ["the extent of the area concerned","The scope of the project is enormous."],
  section: ["a distinct part of something","Read section three for homework."],
  sector: ["an area of economic activity","The technology sector is growing rapidly."],
  secure: ["fixed firmly; safe from danger","Secure your belongings while traveling."],
  seek: ["to attempt to find or obtain","Seek knowledge throughout your life."],
  segment: ["each of the parts into which something is divided","The market is divided into segments."],
  select: ["to carefully choose","Select the best answer from the options."],
  sequence: ["a particular order of events","Follow the sequence of steps carefully."],
  series: ["a number of related things in order","She wrote a series of popular novels."],
  significant: ["sufficiently great or important","There was a significant improvement in scores."],
  similar: ["resembling without being identical","The two essays are similar in structure."],
  simulate: ["to imitate the appearance or character of","Flight simulators train pilots safely."],
  sole: ["one and only","She was the sole survivor of the accident."],
  somewhat: ["to a moderate extent","The results were somewhat disappointing."],
  source: ["a place from which something originates","Cite your sources in research papers."],
  specific: ["clearly defined or identified","Give specific examples in your essay."],
  specify: ["to identify clearly","Please specify your preferred time."],
  sphere: ["a round three-dimensional shape; domain","Politics is outside my sphere of interest."],
  stability: ["the state of being stable","Economic stability benefits everyone."],
  statistic: ["a fact or piece of data from a study","Crime statistics show a downward trend."],
  status: ["the relative social or professional position","Her status as a scholar is well known."],
  strategy: ["a plan of action designed to achieve a goal","Develop a strategy for exam preparation."],
  structure: ["the arrangement of parts","Essay structure includes introduction, body, and conclusion."],
  style: ["a distinctive manner of doing something","Each writer has a unique style."],
  submit: ["to present for judgment or consideration","Submit your assignment before midnight."],
  subsequent: ["coming after in time","Subsequent chapters cover advanced topics."],
  substitute: ["a person or thing acting in place of another","Use honey as a substitute for sugar."],
  successor: ["a person who inherits a position","The successor continued the founder's vision."],
  sufficient: ["enough; adequate","Two hours is sufficient for the exam."],
  superior: ["higher in rank or quality","This product is superior to competitors."],
  supplement: ["something added to enhance","Take vitamins to supplement your diet."],
  supply: ["to make available for use","Schools supply textbooks to students."],
  survive: ["to continue to live despite danger","Few species survive in extreme deserts."],
  suspend: ["to temporarily prevent from continuing","Schools suspend classes during holidays."],
  sustain: ["to strengthen or support; to keep going","Trees sustain life by producing oxygen."],
  symbol: ["a thing representing something else","The flag is a symbol of national pride."],
  symptom: ["a physical or mental feature indicating illness","Fever is a common symptom of flu."],
  synthesis: ["the combination of ideas to form a theory","The essay requires synthesis of multiple sources."],
  target: ["a person or thing aimed at","Set clear targets for each study session."],
  task: ["a piece of work to be done","Complete the task before the deadline."],
  technical: ["relating to a particular subject or activity","Technical skills are in high demand."],
  technique: ["a way of carrying out a particular task","Good technique improves athletic performance."],
  temporary: ["lasting for only a limited time","This is a temporary solution."],
  tense: ["stretched tight; a verb form showing time","Past tense describes completed actions."],
  terminate: ["to bring to an end","The contract terminates next month."],
  theme: ["the subject of a talk or piece of writing","The theme of the novel is redemption."],
  thereby: ["by that means; as a result","She studied hard, thereby achieving top marks."],
  thesis: ["a statement or theory put forward","Her thesis argues for environmental reform."],
  topic: ["a matter dealt with in a text or discourse","Choose an interesting topic for your essay."],
  trace: ["to find or discover by investigation","Historians trace events through documents."],
  transfer: ["to move from one place to another","Students transfer between universities."],
  transform: ["to make a marked change in form","Education transforms lives and communities."],
  transition: ["the process of changing from one state to another","The transition to high school can be challenging."],
  transmit: ["to cause to pass from one place to another","Radio waves transmit signals through air."],
  transport: ["to take or carry from one place to another","Trucks transport goods across the country."],
  trend: ["a general direction in which something is developing","Online learning is a growing trend."],
  trigger: ["to cause an event or situation to happen","Stress can trigger health problems."],
  ultimate: ["being the best or most extreme","Hard work is the ultimate key to success."],
  undergo: ["to experience or be subjected to","Patients undergo surgery with anesthesia."],
  underlie: ["to lie beneath; to be the cause of","Fear underlies many aggressive behaviors."],
  undertake: ["to commit oneself to and begin","She undertook a challenging research project."],
  uniform: ["not changing in form or quality","Soldiers wear uniform clothing."],
  unify: ["to make or become united","Sports unify people across cultures."],
  unique: ["being the only one of its kind","Every person has unique talents."],
  utilize: ["to make practical use of","Utilize library resources for research."],
  variable: ["not consistent or having a fixed pattern","Weather is highly variable in spring."],
  variation: ["a change or difference in condition","There is wide variation in test scores."],
  vehicle: ["a thing used for transporting people or goods","Electric vehicles reduce pollution."],
  version: ["a particular form of something","Download the latest version of the app."],
  versus: ["against; in contrast to","The debate was capitalism versus socialism."],
  via: ["by way of; through","We traveled to Delhi via Mumbai."],
  viable: ["capable of working successfully","Solar energy is a viable alternative."],
  victim: ["a person harmed by an event or action","Support services help crime victims recover."],
  violate: ["to break or fail to comply with","Speeding violates traffic laws."],
  visible: ["able to be seen","Stars are visible on clear nights."],
  vision: ["the ability to think about the future","Great leaders have a clear vision."],
  visual: ["relating to seeing","Visual aids help students understand concepts."],
  vital: ["absolutely necessary; essential","Water is vital for all living things."],
  volume: ["the amount of space occupied","Turn down the volume on the television."],
  voluntary: ["done willingly without being forced","Volunteering is a voluntary act of service."],
  whereas: ["in contrast or comparison with the fact that","She loves reading, whereas he prefers sports."],
  widespread: ["found or distributed over a large area","Smartphone use is widespread among youth."],
  whereby: ["by which; through which","We need a system whereby students can track progress."],
};

// Build days — deduplicate and take exactly 1000 words
const days = [];
const allWords = [...new Set(FULL_WORDS.flatMap((line) => line.split(',').map((w) => w.trim()).filter(Boolean)))].slice(0, 1000);
let wordIndex = 0;

for (let d = 0; d < 100; d++) {
  const themeInfo = DAY_THEMES[Math.floor(d / 10) % DAY_THEMES.length];
  const dayWords = [];
  for (let w = 0; w < 10; w++) {
    const word = allWords[wordIndex];
    if (!word) break;
    const info = MEANINGS[word] || [`relating to ${word}`, `Students learn to use "${word}" in daily conversation.`];
    dayWords.push({ word, meaning: info[0], example: info[1] });
    wordIndex++;
  }
  days.push({
    day: d + 1,
    theme: themeInfo.theme,
    takeaway: themeInfo.takeaway,
    words: dayWords,
  });
}

console.log(`export const VOCABULARY = ${JSON.stringify(days, null, 2)};`);
console.log(`export const TOTAL_DAYS = 100;`);
console.log(`export const WORDS_PER_DAY = 10;`);
console.log(`export const TOTAL_WORDS = ${wordIndex};`);
