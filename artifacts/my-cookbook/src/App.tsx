import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  CircleDot,
  Clock3,
  CloudRain,
  CloudSun,
  Compass,
  CookingPot,
  Flame,
  Heart,
  Home,
  Leaf,
  ListChecks,
  MapPin,
  Minus,
  Moon,
  PenLine,
  Plus,
  Search,
  ShoppingBasket,
  Sparkles,
  Star,
  Sun,
  Timer,
  Trash2,
  Utensils,
  Users,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react';

type View = 'home' | 'make' | 'menu' | 'cook' | 'list' | 'pantry' | 'explore' | 'saved';

type Selection = {
  cuisine: string;
  weather: string;
  mood: string;
  occasion: string;
  time: string;
  budget: string;
  people: number;
  diet: string;
  pantry: string[];
};

type RecipeStep = {
  title: string;
  copy: string;
  timer?: number;
  tool?: string;
};

type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  cuisine: string;
  time: string;
  cost: string;
  people: number;
  ingredients: string[];
  pantry: string[];
  steps: RecipeStep[];
  note: string;
  accent: string;
};

type SavedRecipe = Recipe & { savedAt: string; favorite: boolean; notes: string };

const STORAGE = {
  saved: 'my-cookbook:saved',
  pantry: 'my-cookbook:pantry',
  checks: 'my-cookbook:checks',
  selection: 'my-cookbook:last-selection',
};

const defaultSelection: Selection = {
  cuisine: 'Italian',
  weather: 'Rainy',
  mood: 'Need comfort',
  occasion: 'Weeknight',
  time: '45 minutes',
  budget: 'Keep it easy',
  people: 2,
  diet: 'No restrictions',
  pantry: ['Pappardelle', 'Tomatoes', 'Parmesan', 'Garlic'],
};

const cuisines = ['Italian', 'Mexican', 'Japanese', 'Middle Eastern', 'Southern French'];
const weather = ['Rainy', 'Crisp', 'Sunny', 'Snowy'];
const moods = ['Need comfort', 'Feeling curious', 'Low energy', 'Want to celebrate'];
const occasions = ['Weeknight', 'Date night', 'Friends coming', 'Solo supper'];
const times = ['25 minutes', '45 minutes', 'An hour to wander'];
const budgets = ['Keep it easy', 'A little extra', 'Use what I have'];
const diets = ['No restrictions', 'Vegetarian', 'Dairy-free', 'Gluten-free'];

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function buildRecipe(selection: Selection): Recipe {
  const pantryLead = selection.pantry[0] || 'seasonal vegetables';
  const people = selection.people;
  const moodWord = selection.mood === 'Need comfort' ? 'Rainy night' : selection.mood === 'Feeling curious' ? 'Curious' : selection.mood === 'Low energy' ? 'Gentle' : 'Golden';
  const recipes: Record<string, Omit<Recipe, 'id' | 'people' | 'time' | 'cost' | 'pantry'>> = {
    Italian: {
      title: selection.weather === 'Rainy' ? `${moodWord} Pappardelle` : `${moodWord} Market Pasta`,
      subtitle: 'Silky ribbons, slow tomatoes, and enough parmesan to make the kitchen feel warmer.',
      cuisine: 'Italian comfort',
      ingredients: [`${people} nests pappardelle`, '1 can good tomatoes', '2 cloves garlic', '1 small onion', '1 handful parmesan', 'Olive oil, salt, black pepper'],
      steps: [
        { title: 'Put the kettle on', copy: 'Set a large pot of salted water over high heat. While it comes to a boil, tear the tomatoes into a bowl and crush the garlic with the flat of your knife.', timer: 5, tool: 'large pot' },
        { title: 'Make the quiet sauce', copy: 'Warm olive oil in a wide pan. Add onion and garlic with a pinch of salt. When soft, add tomatoes and let them bubble until glossy.', timer: 14, tool: 'wide pan' },
        { title: 'Catch the ribbons', copy: 'Drop in the pappardelle. Save a mug of cooking water before draining, then slide the pasta into the sauce and loosen until it shines.', timer: 9, tool: 'colander' },
        { title: 'Finish at the table', copy: 'Fold through parmesan and black pepper. Taste for salt, then twirl into warm bowls. Add one last drizzle of olive oil.', tool: 'warm bowls' },
      ],
      note: 'The trick is patience, not precision. Let the tomatoes become their best selves.',
      accent: 'tomato',
    },
    Mexican: {
      title: `${moodWord} Bean Tostadas`,
      subtitle: 'Crisp corn, smoky beans, bright lime, and a little kitchen-table theatre.',
      cuisine: 'Mexican pantry',
      ingredients: [`${people * 2} corn tostadas`, '1 can black beans', '1 ripe avocado', '1 lime', '1 small red onion', 'Smoked paprika, salt, coriander'],
      steps: [
        { title: 'Wake up the beans', copy: 'Warm the beans with smoked paprika, a splash of water, and a pinch of salt until soft enough to crush with the back of a spoon.', timer: 8, tool: 'small pan' },
        { title: 'Make the bright bits', copy: 'Dice the onion and avocado. Toss with lime juice, salt, and whatever fresh herbs are waiting in your fridge.', timer: 6, tool: 'small bowl' },
        { title: 'Build the crunch', copy: 'Spread warm beans over the tostadas. Add the bright bits generously and finish with a dusting of paprika.', tool: 'serving board' },
        { title: 'Eat immediately', copy: 'Carry them to the table while the tostadas still crackle. This is a dinner that does not believe in waiting.', tool: 'your hands' },
      ],
      note: 'Contrast is the whole point: warm and cool, creamy and crisp, smoky and bright.',
      accent: 'mustard',
    },
    Japanese: {
      title: `${moodWord} Miso Noodles`,
      subtitle: 'Brothy, springy, and deeply savory with a soft egg on top.',
      cuisine: 'Japanese-inspired',
      ingredients: [`${people} portions noodles`, '2 tbsp white miso', '1 small carrot', '2 spring onions', '1 egg per person', 'Sesame oil, soy sauce, ginger'],
      steps: [
        { title: 'Start the broth', copy: 'Bring water to a gentle simmer with ginger and a splash of soy. Keep it calm; a rolling boil makes the broth forgetful.', timer: 7, tool: 'saucepan' },
        { title: 'Cook the noodles', copy: 'Add noodles and carrot ribbons. Stir the miso with a ladle of broth in a cup, then return it to the pan.', timer: 6, tool: 'chopsticks' },
        { title: 'Set the eggs', copy: 'Slide eggs into the simmering broth or use the method you trust. You are aiming for a soft center and a quiet confidence.', timer: 5, tool: 'saucepan' },
        { title: 'Make the bowls', copy: 'Divide noodles and broth. Top with spring onions and sesame oil. Eat while the steam is still writing on the windows.', tool: 'deep bowls' },
      ],
      note: 'Miso should be stirred in gently at the end so its round, fermented flavor stays bright.',
      accent: 'sage',
    },
    'Middle Eastern': {
      title: `${moodWord} Sumac Couscous`,
      subtitle: 'A quick, fragrant bowl with roasted chickpeas and jewel-bright herbs.',
      cuisine: 'Middle Eastern pantry',
      ingredients: [`${people} cups couscous`, '1 can chickpeas', '1 cucumber', '1 lemon', 'A handful of herbs', 'Sumac, olive oil, cumin'],
      steps: [
        { title: 'Toast the spices', copy: 'Warm cumin and sumac in a dry pan until fragrant. Add the chickpeas and a ribbon of olive oil, turning them until crisp at the edges.', timer: 10, tool: 'wide pan' },
        { title: 'Steam the couscous', copy: 'Pour boiling water over couscous with salt. Cover and leave it alone, then fluff with a fork.', timer: 7, tool: 'lidded bowl' },
        { title: 'Cut the color', copy: 'Chop cucumber and herbs. Squeeze lemon over everything and season until it tastes like the window is open.', timer: 7, tool: 'sharp knife' },
        { title: 'Layer and serve', copy: 'Pile couscous into bowls, scatter over chickpeas, and finish with the herbs and a last pinch of sumac.', tool: 'wide bowls' },
      ],
      note: 'A squeeze of lemon at the very end makes every other ingredient sound clearer.',
      accent: 'plum',
    },
    'Southern French': {
      title: `${moodWord} Ratatouille Toast`,
      subtitle: 'Soft vegetables, thyme, and thick toast for the evening you want to stretch.',
      cuisine: 'Southern French',
      ingredients: [`${people * 2} slices sourdough`, '1 small aubergine', '1 courgette', '1 red pepper', '1 can tomatoes', 'Thyme, garlic, olive oil'],
      steps: [
        { title: 'Give the vegetables room', copy: 'Cut vegetables into generous pieces. Sear them in batches so they catch some color instead of steaming themselves into silence.', timer: 12, tool: 'large pan' },
        { title: 'Let it soften', copy: 'Add garlic, tomatoes, and thyme. Lower the heat and let the pan become saucy while you toast the bread.', timer: 18, tool: 'wooden spoon' },
        { title: 'Toast the bread', copy: 'Rub the toast with the cut side of a garlic clove. Add olive oil and toast until the edges are bronze.', timer: 5, tool: 'grill pan' },
        { title: 'Make a small feast', copy: 'Spoon vegetables over toast and add more thyme. Eat slowly enough to hear the rain, if there is any.', tool: 'small plates' },
      ],
      note: 'Do not rush the pan. A few extra minutes is where the deep, sweet flavor lives.',
      accent: 'tomato',
    },
  };
  const base = recipes[selection.cuisine] || recipes.Italian;
  const time = selection.time === '25 minutes' ? '25 min' : selection.time === 'An hour to wander' ? '60 min' : '45 min';
  const occasionNote = selection.occasion === 'Date night'
    ? ' Made for lingering over one more glass.'
    : selection.occasion === 'Friends coming'
      ? ' Best served in the middle of the table.'
      : selection.occasion === 'Solo supper'
        ? ' A small, good thing just for you.'
        : '';
  const dietNote = selection.diet !== 'No restrictions' ? ` Naturally ${selection.diet.toLowerCase()}.` : '';
  const weatherNote = selection.weather === 'Sunny' ? ' Keep the window open while it cooks.' : selection.weather === 'Snowy' ? ' The kind of dinner that asks for wool socks.' : '';
  return {
    ...base,
    subtitle: `${base.subtitle}${occasionNote}${dietNote}${weatherNote}`,
    id: `${selection.cuisine}-${selection.mood}-${Date.now()}`,
    people,
    time,
    cost: selection.budget === 'Keep it easy' ? '$' : selection.budget === 'A little extra' ? '$$' : 'pantry-first',
    pantry: selection.pantry,
  };
}

const navItems: { key: View; label: string; icon: LucideIcon }[] = [
  { key: 'home', label: 'Opening page', icon: Home },
  { key: 'make', label: 'Make tonight', icon: Sparkles },
  { key: 'menu', label: 'Tonight’s menu', icon: BookOpen },
  { key: 'cook', label: 'Cook along', icon: ChefHat },
  { key: 'list', label: 'Shopping list', icon: ListChecks },
  { key: 'pantry', label: 'My pantry', icon: CookingPot },
  { key: 'explore', label: 'Explore', icon: Compass },
  { key: 'saved', label: 'My cookbook', icon: Bookmark },
];

function App() {
  const [view, setView] = useState<View>('home');
  const [selection, setSelection] = useState<Selection>(() => readStorage(STORAGE.selection, defaultSelection));
  const [recipe, setRecipe] = useState<Recipe>(() => buildRecipe(readStorage(STORAGE.selection, defaultSelection)));
  const [saved, setSaved] = useState<SavedRecipe[]>(() => readStorage(STORAGE.saved, []));
  const [pantry, setPantry] = useState<string[]>(() => readStorage(STORAGE.pantry, defaultSelection.pantry));
  const [checks, setChecks] = useState<Record<string, boolean>>(() => readStorage(STORAGE.checks, {}));
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.title = 'My Cookbook — dinners with a little feeling';
    const description = document.querySelector('meta[name="description"]') || document.createElement('meta');
    description.setAttribute('name', 'description');
    description.setAttribute('content', 'A warm, interactive kitchen journal for making dinner from the feeling of the day.');
    document.head.appendChild(description);
  }, []);
  useEffect(() => { window.localStorage.setItem(STORAGE.selection, JSON.stringify(selection)); }, [selection]);
  useEffect(() => { window.localStorage.setItem(STORAGE.saved, JSON.stringify(saved)); }, [saved]);
  useEffect(() => { window.localStorage.setItem(STORAGE.pantry, JSON.stringify(pantry)); }, [pantry]);
  useEffect(() => { window.localStorage.setItem(STORAGE.checks, JSON.stringify(checks)); }, [checks]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const navigate = (next: View) => setView(next);
  const compose = () => {
    const next = buildRecipe(selection);
    setRecipe(next);
    setView('menu');
    setToast('A dinner has found you.');
  };
  const saveRecipe = (favorite = true) => {
    setSaved((current) => {
      const existing = current.find((item) => item.title === recipe.title);
      if (existing) return current.map((item) => item.title === recipe.title ? { ...item, favorite: favorite || item.favorite } : item);
      return [{ ...recipe, favorite, savedAt: new Date().toISOString(), notes: '' }, ...current];
    });
    setToast('Tucked into My Cookbook.');
  };

  return (
    <div className="app-shell">
      <DesktopNav view={view} navigate={navigate} />
      <div className="main-canvas">
        <MobileTop navigate={navigate} />
        <AnimatePresence mode="wait">
          <motion.main key={view} className="page-enter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .3 }}>
            {view === 'home' && <HomeView navigate={navigate} recipe={recipe} />}
            {view === 'make' && <MakeView selection={selection} setSelection={setSelection} pantry={pantry} compose={compose} />}
            {view === 'menu' && <MenuView recipe={recipe} saveRecipe={saveRecipe} navigate={navigate} saved={saved} />}
            {view === 'cook' && <CookView recipe={recipe} navigate={navigate} onSave={() => saveRecipe(true)} />}
            {view === 'list' && <ShoppingView recipe={recipe} checks={checks} setChecks={setChecks} pantry={pantry} />}
            {view === 'pantry' && <PantryView pantry={pantry} setPantry={setPantry} recipe={recipe} />}
            {view === 'explore' && <ExploreView onPick={(cuisine) => { setSelection((current) => ({ ...current, cuisine })); setView('make'); }} />}
            {view === 'saved' && <SavedView saved={saved} setSaved={setSaved} openRecipe={(item) => { setRecipe(item); setView('menu'); }} navigate={navigate} />}
          </motion.main>
        </AnimatePresence>
      </div>
      <MobileNav view={view} navigate={navigate} />
      <AnimatePresence>{toast && <motion.div className="toast-note" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" data-testid="status-toast">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function DesktopNav({ view, navigate }: { view: View; navigate: (view: View) => void }) {
  return (
    <aside className="side-nav" aria-label="Main navigation">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true" />
        <div><div className="brand-name">My Cookbook</div><div className="brand-sub">a kitchen journal</div></div>
      </div>
      <p className="nav-label">Find your way around</p>
      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.key} className={`nav-item ${view === item.key ? 'active' : ''}`} onClick={() => navigate(item.key)} data-testid={`button-nav-${item.key}`} aria-current={view === item.key ? 'page' : undefined}><Icon /><span>{item.label}</span></button>;
        })}
      </nav>
      <div className="nav-foot"><p>Keep a little room<br />for improvising.</p></div>
    </aside>
  );
}

function MobileTop({ navigate }: { navigate: (view: View) => void }) {
  return <header className="mobile-top"><button className="brand-lockup" onClick={() => navigate('home')} aria-label="Go to opening page" data-testid="button-mobile-brand"><div className="brand-mark" aria-hidden="true" /><div><div className="brand-name">My Cookbook</div><div className="brand-sub">a kitchen journal</div></div></button><button className="btn btn-small btn-ghost" onClick={() => navigate('make')} data-testid="button-mobile-make"><Sparkles size={15} /> Make</button></header>;
}

function MobileNav({ view, navigate }: { view: View; navigate: (view: View) => void }) {
  const items: { key: View; label: string; icon: LucideIcon }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'make', label: 'Make', icon: Sparkles },
    { key: 'list', label: 'List', icon: ListChecks },
    { key: 'pantry', label: 'Pantry', icon: CookingPot },
    { key: 'saved', label: 'Saved', icon: Bookmark },
  ];
  return <nav className="mobile-nav" aria-label="Mobile navigation">{items.map((item) => { const Icon = item.icon; return <button key={item.key} className={view === item.key ? 'active' : ''} onClick={() => navigate(item.key)} data-testid={`button-mobile-nav-${item.key}`}><Icon /><span>{item.label}</span></button>; })}</nav>;
}

function HomeView({ navigate, recipe }: { navigate: (view: View) => void; recipe: Recipe }) {
  return (
    <div className="page-wrap">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">An evening ritual, made interactive</div>
          <h1 className="display-xl">What does<br />your <em>kitchen</em><br />feel like?</h1>
          <p className="body-lg">Tell me about the weather, your mood, and the bits hiding in your pantry. I’ll turn the feeling of tonight into something warm to eat.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('make')} data-testid="button-start-making"><Sparkles size={16} /> Make tonight’s dinner <ArrowRight size={16} /></button>
            <button className="btn btn-ghost" onClick={() => navigate('saved')} data-testid="button-open-cookbook"><BookOpen size={16} /> Open my cookbook</button>
          </div>
          <div className="hero-note"><span className="hero-note-rule" /><span>Made for the nights when a recipe is not quite enough.</span></div>
        </div>
        <div className="table-scene" aria-label="A hand-drawn cookbook resting on a warm kitchen table">
          <div className="floating-ingredient one" aria-hidden="true" /><div className="floating-ingredient two" aria-hidden="true" /><div className="floating-ingredient three" aria-hidden="true" />
          <div className="journal-card">
            <div className="journal-rings" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
            <div className="journal-date">Tonight’s page · 07:14 pm</div>
            <h2>Something good is simmering.</h2>
            <p>“The best meals start as a small question: what would feel kind right now?”</p>
            <div className="journal-stamp">OPEN<br />WHEN<br />HUNGRY</div>
          </div>
        </div>
      </section>
      <section className="home-strip" aria-label="How My Cookbook works">
        <div className="strip-item"><span className="strip-number">01</span><div><strong>Set the scene</strong><p>Weather, mood, company, and what you can reach without going to the shop.</p></div></div>
        <div className="strip-item"><span className="strip-number">02</span><div><strong>Follow the thread</strong><p>A recipe shaped around your evening, with a little room to make it yours.</p></div></div>
        <div className="strip-item"><span className="strip-number">03</span><div><strong>Keep the page</strong><p>Save the winners, leave notes, and build a cookbook that sounds like you.</p></div></div>
      </section>
      <section style={{ paddingTop: 62 }}>
        <div className="section-head"><div><div className="eyebrow">Your last little idea</div><h2 className="display-md" style={{ marginTop: 10 }}>{recipe.title}</h2></div><p>Your current recipe is waiting in the wings. Change the scene whenever the evening changes its mind.</p></div>
        <button className="paper-panel" style={{ border: 0, width: '100%', padding: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => navigate('menu')} data-testid="button-resume-recipe"><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 20px' }}><span><span className="micro">Saved in the air · {recipe.time} · {recipe.cuisine}</span><br /><strong style={{ fontFamily:'var(--font-display)', fontSize:22 }}>{recipe.subtitle}</strong></span><ChevronRight color="var(--tomato)" /></div></button>
      </section>
    </div>
  );
}

function MakeView({ selection, setSelection, pantry, compose }: { selection: Selection; setSelection: Dispatch<SetStateAction<Selection>>; pantry: string[]; compose: () => void }) {
  const set = (key: keyof Selection, value: string | number) => setSelection((current) => ({ ...current, [key]: value }));
  const addPantry = (item: string) => { if (item.trim() && !selection.pantry.includes(item.trim())) setSelection((current) => ({ ...current, pantry: [...current.pantry, item.trim()] })); };
  const removePantry = (item: string) => setSelection((current) => ({ ...current, pantry: current.pantry.filter((entry) => entry !== item) }));
  return (
    <div className="page-wrap">
      <div className="section-head"><div><div className="eyebrow">Page one · set the scene</div><h1 className="display-lg" style={{ marginTop: 12 }}>Let’s make tonight<br />taste like <span style={{ color:'var(--tomato)' }}>you.</span></h1></div><p>There are no wrong answers here. This is less a quiz, more a way of noticing what kind of dinner the evening is asking for.</p></div>
      <div className="creator-layout">
        <div className="paper-panel creator-form">
          <ChoiceSection title="Where should we wander?" number="01" options={cuisines} value={selection.cuisine} onChange={(value) => set('cuisine', value)} icons={[Utensils, Flame, Leaf, Wheat, Sun]} />
          <ChoiceSection title="What’s outside the window?" number="02" options={weather} value={selection.weather} onChange={(value) => set('weather', value)} icons={[CloudRain, CloudSun, Sun, Moon]} />
          <ChoiceSection title="And inside your head?" number="03" options={moods} value={selection.mood} onChange={(value) => set('mood', value)} icons={[Heart, Compass, Moon, Sparkles]} />
          <ChoiceSection title="Who’s pulling up a chair?" number="04" options={occasions} value={selection.occasion} onChange={(value) => set('occasion', value)} icons={[Clock3, Heart, Users, CircleDot]} />
          <div className="form-section">
            <div className="form-section-title"><h3>How much room is there?</h3><span>05 · pace</span></div>
            <div className="choice-grid">{times.map((item) => <button key={item} className={`choice ${selection.time === item ? 'selected' : ''}`} onClick={() => set('time', item)} data-testid={`button-time-${item}`}><Timer size={15} /> {item}</button>)}</div>
            <div className="choice-grid" style={{ marginTop: 9 }}>{budgets.map((item) => <button key={item} className={`choice ${selection.budget === item ? 'selected' : ''}`} onClick={() => set('budget', item)} data-testid={`button-budget-${item}`}><span style={{ fontFamily:'var(--font-mono)' }}>{item === 'Keep it easy' ? '$' : item === 'A little extra' ? '$$' : '⌁'}</span> {item}</button>)}</div>
          </div>
          <div className="form-section">
            <div className="form-section-title"><h3>How many bowls?</h3><span>06 · company</span></div>
            <div style={{ display:'flex', alignItems:'center', gap:15 }}><button className="btn btn-ghost btn-small" onClick={() => set('people', Math.max(1, selection.people - 1))} aria-label="Decrease people" data-testid="button-decrease-people"><Minus size={14} /></button><strong style={{ font:'600 30px var(--font-display)', minWidth:35, textAlign:'center' }} data-testid="text-people-count">{selection.people}</strong><button className="btn btn-ghost btn-small" onClick={() => set('people', Math.min(10, selection.people + 1))} aria-label="Increase people" data-testid="button-increase-people"><Plus size={14} /></button><span className="micro">people eating tonight</span></div>
          </div>
          <ChoiceSection title="Any gentle boundaries?" number="07" options={diets} value={selection.diet} onChange={(value) => set('diet', value)} icons={[CircleDot, Leaf, Wheat, Sparkles]} />
          <div className="form-section">
            <div className="form-section-title"><h3>What’s already in the pantry?</h3><span>08 · the good stuff</span></div>
            <p style={{ fontSize:12, color:'var(--muted-foreground)', marginTop:-7 }}>Pick from your shelves, or add the odd ingredient you want to use up.</p>
            <div className="tag-row">{pantry.map((item) => <button key={item} className={`choice ${selection.pantry.includes(item) ? 'selected' : ''}`} onClick={() => selection.pantry.includes(item) ? removePantry(item) : addPantry(item)} data-testid={`button-pantry-choice-${item}`}><Check size={13} /> {item}</button>)}</div>
            <PantryAdder onAdd={addPantry} />
            <div className="tag-row">{selection.pantry.map((item) => <span className="ingredient-tag" key={item}>{item} <button onClick={() => removePantry(item)} aria-label={`Remove ${item}`} data-testid={`button-remove-ingredient-${item}`}><X size={11} /></button></span>)}</div>
          </div>
        </div>
        <aside className="creator-aside">
          <div className="paper-panel aside-card"><span className="eyebrow">The working note</span><h3>A good dinner starts with a little curiosity.</h3><p>We’ll use your answers as a compass, not a cage. You can change every ingredient once the page turns.</p><span className="scribble">no overthinking →</span><div className="selection-summary"><SummaryRow label="Cuisine" value={selection.cuisine} /><SummaryRow label="Feeling" value={selection.mood} /><SummaryRow label="Pace" value={selection.time} /><SummaryRow label="For" value={`${selection.people} ${selection.people === 1 ? 'person' : 'people'}`} /></div></div>
          <div className="paper-panel aside-card" style={{ background:'var(--mustard)' }}><span className="micro" style={{ color:'var(--ink)' }}>Ready when you are</span><h3 style={{ marginTop:11 }}>Turn the page.</h3><p style={{ color:'rgba(56,37,27,.7)' }}>Your dinner will be made from this exact little constellation of choices.</p><button className="btn btn-ink" onClick={compose} data-testid="button-compose-dinner">Compose my dinner <ArrowRight size={15} /></button></div>
        </aside>
      </div>
    </div>
  );
}

function ChoiceSection({ title, number, options, value, onChange, icons }: { title: string; number: string; options: string[]; value: string; onChange: (value: string) => void; icons: LucideIcon[] }) {
  return <div className="form-section"><div className="form-section-title"><h3>{title}</h3><span>{number} · choose one</span></div><div className="choice-grid">{options.map((item, index) => { const Icon = icons[index % icons.length]; return <button key={item} className={`choice ${value === item ? 'selected' : ''}`} onClick={() => onChange(item)} data-testid={`button-choice-${item}`}><Icon size={15} /> {item}</button>; })}</div></div>;
}

function PantryAdder({ onAdd }: { onAdd: (item: string) => void }) {
  const [value, setValue] = useState('');
  const add = () => { if (!value.trim()) return; onAdd(value); setValue(''); };
  return <div className="pantry-input"><input className="input-field" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') add(); }} placeholder="Add something..." aria-label="Add pantry ingredient" data-testid="input-pantry-ingredient" /><button className="btn btn-ghost btn-small" onClick={add} data-testid="button-add-pantry-ingredient"><Plus size={15} /> Add</button></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="summary-row"><span>{label}</span><span>{value}</span></div>;
}

function MenuView({ recipe, saveRecipe, navigate, saved }: { recipe: Recipe; saveRecipe: (favorite?: boolean) => void; navigate: (view: View) => void; saved: SavedRecipe[] }) {
  const isSaved = saved.some((item) => item.title === recipe.title);
  const favorite = saved.find((item) => item.title === recipe.title)?.favorite;
  return (
    <div className="page-wrap">
      <section className="reveal-hero"><div className="reveal-content"><div className="eyebrow">Page two · the reveal</div><h1>Tonight,<br />we’re making<br /><span style={{ color:'var(--mustard)' }}>{recipe.title}.</span></h1><p>{recipe.subtitle} It feels right for a quiet evening, with {recipe.people} {recipe.people === 1 ? 'bowl' : 'bowls'} on the table.</p><div className="reveal-meta"><span className="meta-pill"><Clock3 size={13} style={{ verticalAlign:'-2px', marginRight:5 }} /> {recipe.time}</span><span className="meta-pill"><Users size={13} style={{ verticalAlign:'-2px', marginRight:5 }} /> {recipe.people} people</span><span className="meta-pill">{recipe.cost} · pantry-aware</span></div></div></section>
      <div className="reveal-body">
        <section className="paper-panel recipe-sheet">
          <div className="recipe-sheet-head"><div><span className="eyebrow">{recipe.cuisine}</span><h2>The page, before the flame.</h2><div className="sheet-sub">Gather this little cast of characters. Your pantry ingredients are marked.</div></div><button className={`favorite-btn ${favorite ? 'active' : ''}`} onClick={() => saveRecipe(true)} aria-label={favorite ? 'Recipe is a favorite' : 'Favorite this recipe'} data-testid="button-favorite-recipe"><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button></div>
          <div className="ingredient-columns"><div><h4>Bring to the table</h4><ul className="ingredient-list">{recipe.ingredients.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h4>Already on hand</h4><ul className="ingredient-list">{recipe.pantry.length ? recipe.pantry.map((item) => <li key={item}>{item}</li>) : <li>We’ll make a short list for you.</li>}</ul></div></div>
          <div className="action-row"><button className="btn btn-primary" onClick={() => navigate('cook')} data-testid="button-start-cooking"><ChefHat size={16} /> Start cooking <ArrowRight size={16} /></button><button className="btn btn-ghost" onClick={() => navigate('list')} data-testid="button-open-shopping-list"><ShoppingBasket size={16} /> See shopping list</button><button className="btn btn-ghost" onClick={() => navigate('make')} data-testid="button-change-mood"><PenLine size={15} /> Change the mood</button></div>
        </section>
        <aside className="side-recipe-note"><span className="micro">A note from the margins</span><p>“{recipe.note}”</p><div style={{ marginTop:28, font:'11px var(--font-mono)', color:'#e5c8bd' }}>{isSaved ? '✓ This page is in your cookbook.' : 'Save this page if it feels like yours.'}</div></aside>
      </div>
    </div>
  );
}

function ingredientName(item: string) {
  return item.replace(/^\d+\s+(?:tbsp|tsp|cups?|cloves?|handful|can|small|large|ripe|per person)\s*/i, '').replace(/^A\s+/i, '');
}

function CookingStage({ recipe, step, addedIngredients, served, onAddIngredient }: {
  recipe: Recipe;
  step: number;
  addedIngredients: number[];
  served: boolean;
  onAddIngredient: (index: number) => void;
}) {
  const allIngredients = recipe.ingredients.slice(0, 6);
  const heat = Math.min(100, 22 + step * 19 + addedIngredients.length * 7);
  const stageCopy = served
    ? 'The last little move is yours: carry it to the table.'
    : step === 0
      ? 'Tap an ingredient to bring it into the station.'
      : step === recipe.steps.length - 1
        ? 'Everything has come together. Give it one last turn.'
        : 'The pan is listening. Keep adding what the page calls for.';

  return (
    <div className={`cooking-stage stage-${step} ${served ? 'is-served' : ''}`} aria-label="Animated cooking station">
      <div className="stage-glow" style={{ opacity: 0.18 + heat / 290 }} />
      <div className="stage-label"><span className="micro">The counter</span><span>{addedIngredients.length}/{allIngredients.length} ingredients in motion</span></div>

      <div className="ingredient-orbit" aria-label="Ingredients to add">
        {allIngredients.map((item, index) => {
          const isAdded = addedIngredients.includes(index);
          return (
            <motion.button
              type="button"
              key={item}
              className={`ingredient-morsel ingredient-morsel-${index} ${isAdded ? 'is-added' : ''}`}
              onClick={() => onAddIngredient(index)}
              aria-label={`${isAdded ? 'Remove' : 'Add'} ${ingredientName(item)} ${isAdded ? 'from the pan' : 'to the pan'}`}
              data-testid={`button-cook-ingredient-${index}`}
              animate={isAdded ? { scale: 0.78, x: 0, y: 102, rotate: 180, opacity: 0.1 } : { scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 17 }}
              whileHover={{ y: -5, rotate: index % 2 ? 3 : -3 }}
              whileTap={{ scale: 0.92 }}
            >
              <span className="morsel-mark" aria-hidden="true"><CircleDot size={15} /></span>
              <span>{ingredientName(item)}</span>
              <small>{isAdded ? 'in the pan' : 'add'}</small>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        className="pan-shadow"
        animate={served ? { scale: 0.9, opacity: 0.25 } : { scale: 1, opacity: 0.48 }}
      />
      <motion.div className="pan-illustration" animate={served ? { y: 22, rotate: -4 } : { y: [0, -2, 0], rotate: [-1, 1, -1] }} transition={served ? { duration: .5 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="pan-handle" />
        <div className="pan-rim">
          <motion.div className="pan-interior" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <div className="pan-food">
              {Array.from({ length: Math.max(3, Math.min(9, addedIngredients.length + step + 2)) }).map((_, index) => (
                <motion.i
                  key={index}
                  style={{ left: `${18 + ((index * 17) % 62)}%`, top: `${20 + ((index * 23) % 54)}%` }}
                  animate={{ y: [0, -4, 0], rotate: [0, 12, -8, 0] }}
                  transition={{ duration: 1.8 + index * .15, repeat: Infinity, delay: index * -.2, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </motion.div>
        </div>
        <div className="heat-ring heat-ring-one" style={{ opacity: heat / 160 }} />
        <div className="heat-ring heat-ring-two" style={{ opacity: heat / 200 }} />
        <div className="steam-column" aria-hidden="true">
          <motion.b animate={{ y: [4, -28, 4], opacity: [0, .55, 0], x: [0, 7, -3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0 }} />
          <motion.b animate={{ y: [2, -34, 2], opacity: [0, .4, 0], x: [0, -6, 5] }} transition={{ duration: 2.8, repeat: Infinity, delay: -.8 }} />
          <motion.b animate={{ y: [8, -25, 8], opacity: [0, .5, 0], x: [0, 4, -5] }} transition={{ duration: 2.2, repeat: Infinity, delay: -1.4 }} />
        </div>
      </motion.div>

      <div className="stage-footer">
        <span>{stageCopy}</span>
        <span className="heat-meter"><Flame size={14} /> heat <i><b style={{ width: `${heat}%` }} /></i></span>
      </div>

      <AnimatePresence>
        {served && (
          <motion.div className="served-plate" initial={{ opacity: 0, scale: .72, rotate: -12 }} animate={{ opacity: 1, scale: 1, rotate: 2 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
            <div className="served-food"><span /><span /><span /></div>
            <div className="served-steam"><i /><i /><i /></div>
            <strong>ready</strong>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CookView({ recipe, navigate, onSave }: { recipe: Recipe; navigate: (view: View) => void; onSave: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState<number[]>([]);
  const [served, setServed] = useState(false);
  useEffect(() => {
    if (!timerRunning || seconds === null || seconds <= 0) return;
    const interval = window.setInterval(() => setSeconds((value) => value !== null ? Math.max(0, value - 1) : value), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, seconds]);
  useEffect(() => { if (seconds === 0) setTimerRunning(false); }, [seconds]);
  const current = recipe.steps[step];
  const markStep = (index: number) => setDone((items) => items.includes(index) ? items : [...items, index]);
  const addIngredient = (index: number) => setAddedIngredients((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index]);
  const goNext = () => {
    markStep(step);
    setAddedIngredients((items) => Array.from(new Set([...items, ...recipe.ingredients.map((_, index) => index).slice(0, Math.min(recipe.ingredients.length, (step + 1) * 2))])));
    if (step < recipe.steps.length - 1) { setStep(step + 1); setSeconds(null); setTimerRunning(false); }
  };
  const formatTimer = (value: number) => `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
  const timerProgress = current.timer && seconds !== null ? Math.max(0, Math.min(100, ((current.timer * 60 - seconds) / (current.timer * 60)) * 100)) : 0;
  return (
    <div className="page-wrap">
      <div className="section-head"><div><div className="eyebrow">Page three · hands on</div><h1 className="display-lg" style={{ marginTop:12 }}>Cook the page.</h1></div><p>Put your phone somewhere flour can’t reach. We’ll keep the next move close by.</p></div>
      <div className="cook-layout">
        <aside className="cook-progress"><div className="micro">Your little route</div><div className="progress-list">{recipe.steps.map((item, index) => <button key={item.title} className={`progress-step ${index === step ? 'active' : ''} ${done.includes(index) ? 'done' : ''}`} onClick={() => setStep(index)} data-testid={`button-cook-step-${index}`}><span className="step-dot">{done.includes(index) ? <Check size={12} /> : index + 1}</span><span>{item.title}</span></button>)}</div><div style={{ marginTop:22, padding:'13px', background:'rgba(184,74,53,.08)', color:'var(--tomato)', font:'11px/1.45 var(--font-mono)' }}>{done.length} of {recipe.steps.length} pages turned</div></aside>
        <section className="paper-panel cook-card">
          <div className="cook-card-top"><div><div className="step-kicker">Move {step + 1} of {recipe.steps.length}</div><h1>{current.title}</h1><p className="step-copy">{current.copy}</p></div><div className="micro" style={{ whiteSpace:'nowrap' }}>{recipe.title}</div></div>
          <div className="step-tools">{current.tool && <span className="tool-chip"><CookingPot size={14} /> You’ll need · {current.tool}</span>}<span className="tool-chip"><Flame size={14} /> Keep the heat kind</span></div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .28 }}>
              <CookingStage recipe={recipe} step={step} addedIngredients={addedIngredients} served={served} onAddIngredient={addIngredient} />
            </motion.div>
          </AnimatePresence>
          {current.timer && <div className="timer-card"><div className="timer-readout"><span className="micro">A soft timer</span><br /><strong>{seconds === null ? `${current.timer}:00` : formatTimer(seconds)}</strong><span className="timer-progress"><i style={{ width: `${timerProgress}%` }} /></span></div><div className="timer-actions">{seconds === null || seconds === 0 ? <button className="btn btn-ink btn-small" onClick={() => { setSeconds(current.timer! * 60); setTimerRunning(true); }} data-testid="button-start-timer"><Timer size={14} /> Start {current.timer} min</button> : <button className="btn btn-ghost btn-small" onClick={() => setTimerRunning((value) => !value)} data-testid="button-toggle-timer">{timerRunning ? 'Pause' : 'Resume'}</button>}<button className="btn btn-ghost btn-small" onClick={() => { setSeconds(null); setTimerRunning(false); }} data-testid="button-reset-timer">Reset</button></div></div>}
          {step === recipe.steps.length - 1 ? <div className="completion"><h3>{served ? 'The table is ready.' : 'Give it a last turn.'}</h3><p>{served ? `You made ${recipe.title}. Take the first bite before you decide whether it needs anything.` : 'Tap serve when the sauce looks glossy and the page feels complete.'}</p><div className="action-row" style={{ marginTop:0 }}>{!served && <button className="btn btn-paper" onClick={() => { setServed(true); markStep(step); }} data-testid="button-serve-recipe"><Utensils size={15} /> Serve the table</button>}<button className="btn btn-paper" onClick={onSave} data-testid="button-save-completed-recipe"><Bookmark size={15} /> Keep this recipe</button><button className="btn btn-ghost" style={{ borderColor:'rgba(248,240,223,.35)', color:'#f8f0df' }} onClick={() => navigate('home')} data-testid="button-finish-cooking">Back to the opening page</button></div></div> : <div className="cook-foot"><button className="btn btn-ghost" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} data-testid="button-previous-step"><ArrowLeft size={15} /> Previous move</button><button className="btn btn-primary" onClick={goNext} data-testid="button-complete-step">Done with this move <CheckCircle2 size={15} /></button></div>}
        </section>
      </div>
    </div>
  );
}

function ShoppingView({ recipe, checks, setChecks, pantry }: { recipe: Recipe; checks: Record<string, boolean>; setChecks: Dispatch<SetStateAction<Record<string, boolean>>>; pantry: string[] }) {
  const need = recipe.ingredients.filter((item) => !pantry.some((available) => item.toLowerCase().includes(available.toLowerCase()) || available.toLowerCase().includes(item.toLowerCase().split(' ').pop() || '')));
  const pantryItems = recipe.ingredients.filter((item) => !need.includes(item));
  const toggle = (item: string) => setChecks((current) => ({ ...current, [item]: !current[item] }));
  return (
    <div className="page-wrap">
      <div className="section-head"><div><div className="eyebrow">The practical page</div><h1 className="display-lg" style={{ marginTop:12 }}>A short trip<br />to the shop.</h1></div><p>Only the things your shelves couldn’t quite provide. Check things off as you go; the list remembers.</p></div>
      <div className="utility-layout">
        <section className="paper-panel utility-panel"><div style={{ display:'flex', justifyContent:'space-between', alignItems:'end' }}><div><span className="micro">For {recipe.title}</span><h2 className="display-md" style={{ marginTop:9 }}>Bring home</h2></div><span className="count-badge">{need.filter((item) => !checks[item]).length} to go</span></div><div className="list-group"><h3>Market list <span className="micro">{need.length} items</span></h3><ul className="check-list">{need.map((item, index) => <li className={`check-row ${checks[item] ? 'checked' : ''}`} key={item}><input type="checkbox" checked={Boolean(checks[item])} onChange={() => toggle(item)} aria-label={`Mark ${item} as purchased`} data-testid={`checkbox-shopping-${index}`} /><span data-testid={`text-shopping-item-${index}`}>{item}</span></li>)}</ul>{need.length === 0 && <div className="saved-empty"><CheckCircle2 color="var(--sage)" size={28} /><h3>Pantry magic.</h3><p>You already have everything this recipe needs.</p></div>}</div></section>
        <aside className="pantry-shelf"><span className="micro" style={{ color:'var(--mustard)' }}>Already waiting</span><h3>On your shelves</h3><p>These are doing their part tonight, so they stay off the shopping list.</p><div className="pantry-jars">{(pantryItems.length ? pantryItems : pantry.slice(0, 6)).map((item) => <div className="jar" key={item}>{item.replace(/^\d+\s*/, '')}</div>)}</div><div style={{ marginTop:20, font:'11px/1.5 var(--font-mono)', color:'rgba(249,239,220,.6)' }}><Search size={13} style={{ verticalAlign:'-2px', marginRight:5 }} /> Missing something? Add it in My Pantry.</div></aside>
      </div>
    </div>
  );
}

function PantryView({ pantry, setPantry, recipe }: { pantry: string[]; setPantry: Dispatch<SetStateAction<string[]>>; recipe: Recipe }) {
  const [value, setValue] = useState('');
  const [filter, setFilter] = useState('');
  const add = () => { const item = value.trim(); if (!item || pantry.includes(item)) return; setPantry((current) => [...current, item]); setValue(''); };
  const shown = pantry.filter((item) => item.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="page-wrap">
      <div className="section-head"><div><div className="eyebrow">The room behind the recipe</div><h1 className="display-lg" style={{ marginTop:12 }}>My pantry,<br />in real life.</h1></div><p>A small record of what is already within reach. Keep it honest. A half lemon counts.</p></div>
      <div className="utility-layout">
        <section className="pantry-shelf" style={{ minHeight:430 }}><span className="micro" style={{ color:'var(--mustard)' }}>Shelf inventory · {pantry.length} things</span><h3>What’s in the cupboard?</h3><p>Ingredients you add here quietly steer the next dinner toward something you already have.</p><div className="pantry-jars">{shown.slice(0, 9).map((item) => <div className="jar" key={item}>{item}</div>)}</div>{shown.length === 0 && <p style={{ marginTop:25 }}>Nothing by that name yet. Try the search again or add it below.</p>}<div style={{ marginTop:26, display:'flex', gap:8 }}><input className="input-field" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') add(); }} placeholder="A half lemon, perhaps..." aria-label="Add item to pantry" data-testid="input-pantry-shelf" /><button className="btn btn-paper btn-small" onClick={add} data-testid="button-add-shelf-item"><Plus size={15} /> Add</button></div></section>
        <aside className="paper-panel utility-panel"><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><h2 className="display-md">The list</h2><span className="count-badge">{shown.length}</span></div><div style={{ position:'relative', margin:'20px 0' }}><Search size={15} style={{ position:'absolute', left:10, top:13, color:'var(--muted-foreground)' }} /><input className="input-field" style={{ paddingLeft:32 }} value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Look for an ingredient" aria-label="Search pantry" data-testid="input-search-pantry" /></div><ul className="check-list">{shown.map((item) => <li className="check-row" key={item}><Wheat size={15} color="var(--tomato)" /><span style={{ flex:1 }}>{item}</span><button className="btn btn-ghost btn-small" style={{ minHeight:27, padding:'0 7px' }} onClick={() => setPantry((current) => current.filter((entry) => entry !== item))} aria-label={`Remove ${item} from pantry`} data-testid={`button-delete-pantry-${item}`}><Trash2 size={13} /></button></li>)}</ul><div style={{ marginTop:22, paddingTop:18, borderTop:'1px solid rgba(110,75,47,.16)', fontSize:12, color:'var(--muted-foreground)', lineHeight:1.5 }}><Star size={14} color="var(--tomato)" style={{ verticalAlign:'-3px', marginRight:5 }} /> Your current recipe uses <strong style={{ color:'var(--ink)' }}>{recipe.pantry.length || 'none'}</strong> of these.</div></aside>
      </div>
    </div>
  );
}

function ExploreView({ onPick }: { onPick: (cuisine: string) => void }) {
  const [mode, setMode] = useState<'world' | 'mood'>('world');
  const moodsExplore = [{ title:'For a table of four', copy:'Big platters, second helpings, and something that can wait while people arrive.', cuisine:'Middle Eastern', icon:Users }, { title:'For the quiet hour', copy:'Soft textures, one bowl, and a recipe that will not ask too many questions.', cuisine:'Japanese', icon:Moon }, { title:'For a little celebration', copy:'Bright colors, crisp edges, and an excuse to open the bottle you were saving.', cuisine:'Mexican', icon:Sparkles }];
  return (
    <div className="page-wrap">
      <div className="section-head"><div><div className="eyebrow">A page to wander</div><h1 className="display-lg" style={{ marginTop:12 }}>Where is dinner<br />taking you?</h1></div><p>Browse by a place, a feeling, or a table full of people. Pick a thread and we’ll carry it into the dinner maker.</p></div>
      <div style={{ display:'flex', gap:8, marginBottom:20 }}><button className={`btn ${mode === 'world' ? 'btn-ink' : 'btn-ghost'} btn-small`} onClick={() => setMode('world')} data-testid="button-explore-world"><MapPin size={14} /> Around the world</button><button className={`btn ${mode === 'mood' ? 'btn-ink' : 'btn-ghost'} btn-small`} onClick={() => setMode('mood')} data-testid="button-explore-moods"><Heart size={14} /> Around the feeling</button></div>
      {mode === 'world' ? <div className="explore-grid"><section className="world-map"><span className="micro" style={{ color:'var(--mustard)' }}>Little map of possibility</span><h2>Follow the flavor line.</h2><p style={{ color:'rgba(247,237,217,.68)', fontSize:12, maxWidth:250, lineHeight:1.5 }}>Every kitchen keeps a different kind of comfort. Start anywhere.</p><button className="map-pin" style={{ left:'28%', top:'48%' }} data-label="Naples" onClick={() => onPick('Italian')} aria-label="Explore Italian food in Naples" data-testid="button-explore-italian" /><button className="map-pin" style={{ left:'57%', top:'61%' }} data-label="Kyoto" onClick={() => onPick('Japanese')} aria-label="Explore Japanese food in Kyoto" data-testid="button-explore-japanese" /><button className="map-pin" style={{ left:'41%', top:'56%' }} data-label="Marrakesh" onClick={() => onPick('Middle Eastern')} aria-label="Explore Middle Eastern food in Marrakesh" data-testid="button-explore-middle-eastern" /><button className="map-pin" style={{ left:'17%', top:'66%' }} data-label="Oaxaca" onClick={() => onPick('Mexican')} aria-label="Explore Mexican food in Oaxaca" data-testid="button-explore-mexican" /></section><div className="explore-stack"><ExploreCard title="Naples after rain" copy="Tomato, black pepper, and the patience to let pasta become a whole mood." label="Italian" onClick={() => onPick('Italian')} /><ExploreCard title="Kyoto at first light" copy="Miso broth, springy noodles, and quiet precision." label="Japanese" onClick={() => onPick('Japanese')} /></div></div> : <div className="saved-grid">{moodsExplore.map(({ title, copy, cuisine, icon: Icon }) => <button className="mood-card" key={title} onClick={() => onPick(cuisine)} style={{ textAlign:'left', cursor:'pointer' }} data-testid={`button-explore-mood-${cuisine}`}><Icon size={20} color="var(--tomato)" /><h3>{title}</h3><p>{copy}</p><span className="micro">Try {cuisine} <ChevronRight size={12} style={{ verticalAlign:'-2px' }} /></span></button>)}</div>}
    </div>
  );
}

function ExploreCard({ title, copy, label, onClick }: { title: string; copy: string; label: string; onClick: () => void }) {
  return <button className="mood-card" onClick={onClick} style={{ textAlign:'left', cursor:'pointer' }} data-testid={`button-explore-card-${label}`}><span className="eyebrow">{label}</span><h3>{title}</h3><p>{copy}</p><span className="micro">Carry this into dinner <ChevronRight size={12} style={{ verticalAlign:'-2px' }} /></span></button>;
}

function SavedView({ saved, setSaved, openRecipe, navigate }: { saved: SavedRecipe[]; setSaved: Dispatch<SetStateAction<SavedRecipe[]>>; openRecipe: (recipe: SavedRecipe) => void; navigate: (view: View) => void }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => saved.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.cuisine.toLowerCase().includes(query.toLowerCase())), [saved, query]);
  const updateNotes = (id: string, notes: string) => setSaved((current) => current.map((item) => item.id === id ? { ...item, notes } : item));
  const remove = (id: string) => setSaved((current) => current.filter((item) => item.id !== id));
  return (
    <div className="page-wrap">
      <div className="section-head"><div><div className="eyebrow">The pages you kept</div><h1 className="display-lg" style={{ marginTop:12 }}>My Cookbook.</h1></div><p>A growing record of dinners that made the evening feel a little more like yours. Add a note while you still remember.</p></div>
      {saved.length > 0 && <div style={{ maxWidth:390, position:'relative', marginBottom:26 }}><Search size={15} style={{ position:'absolute', left:11, top:13, color:'var(--muted-foreground)' }} /><input className="input-field" style={{ paddingLeft:33 }} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your pages" aria-label="Search saved recipes" data-testid="input-search-saved" /></div>}
      {filtered.length === 0 ? <div className="saved-empty"><Bookmark color="var(--tomato)" size={30} /><h3>{saved.length ? 'No page by that name.' : 'The first page is blank.'}</h3><p>{saved.length ? 'Try another search, or make a fresh dinner.' : 'When a recipe earns a place here, it will stay close. Start with tonight’s dinner.'}</p><button className="btn btn-primary" onClick={() => navigate('make')} data-testid="button-empty-create-recipe"><Sparkles size={15} /> Make a recipe</button></div> : <div className="saved-grid">{filtered.map((item) => <article className="saved-card" key={item.id} data-testid={`card-saved-recipe-${item.id}`}><div className="saved-top"><span className="micro">{item.cuisine} · {item.time}</span><div style={{ display:'flex', gap:5 }}><button className="favorite-btn" style={{ width:30, height:30 }} onClick={() => setSaved((current) => current.map((entry) => entry.id === item.id ? { ...entry, favorite: !entry.favorite } : entry))} aria-label={`Toggle favorite for ${item.title}`} data-testid={`button-toggle-favorite-${item.id}`}><Heart size={14} fill={item.favorite ? 'currentColor' : 'none'} /></button><button className="favorite-btn" style={{ width:30, height:30, background:'rgba(56,37,27,.07)', color:'var(--muted-foreground)' }} onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`} data-testid={`button-delete-saved-${item.id}`}><Trash2 size={14} /></button></div></div><button onClick={() => openRecipe(item)} style={{ border:0, padding:0, background:'transparent', textAlign:'left', color:'inherit', cursor:'pointer', width:'100%' }} data-testid={`button-open-saved-${item.id}`}><h3>{item.title}</h3><p>{item.subtitle}</p></button><textarea className="notes-area" value={item.notes} onChange={(event) => updateNotes(item.id, event.target.value)} placeholder="A note for next time..." aria-label={`Notes for ${item.title}`} data-testid={`textarea-notes-${item.id}`} /><div style={{ marginTop:11, display:'flex', justifyContent:'space-between', alignItems:'center' }}><span className="micro">{item.notes ? 'Note kept' : 'Add a margin note'}</span><button className="btn btn-ghost btn-small" onClick={() => openRecipe(item)} data-testid={`button-cook-saved-${item.id}`}>Cook again <ArrowRight size={13} /></button></div></article>)}</div>}
    </div>
  );
}

export default App;