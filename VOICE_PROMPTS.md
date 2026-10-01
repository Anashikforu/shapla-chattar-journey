# Shapla Chattar Live: voice and sound prompt sheet

Use this sheet with any voice model that speaks Bangla well (ElevenLabs Voice Design plus Text to Speech, Google or OpenAI TTS, or your own model). Check that the model lists Bengali and can handle a Dhaka street accent. The scene works without any clips. Every clip you add replaces a speech bubble's silence or a sound that is otherwise drawn in code.

---

## 1. How the clips plug into the scene

- **Naming.** Name each file after its ID, for example `hawker_tea_1.mp3`. Extra takes of the same line use a dash suffix: `hawker_tea_1-b.mp3` and `hawker_tea_1-c.mp3`. The scene picks a random take each time.
- **Formats.** mp3, wav, ogg or m4a.
- **Loading, option A.** Open the scene, click **Voices**, then drop the files in or choose them. They stay loaded until you reload the page.
- **Loading, option B.** Put the files in `shapla-chattar/voices/` and create `voices/voices.js`:
  ```js
  window.SHAPLA_VOICES = {
    "hawker_tea_1": ["voices/hawker_tea_1.mp3", "voices/hawker_tea_1-b.mp3"],
    "helper_gulistan_1": "voices/helper_gulistan_1.mp3"
    // ...
  };
  ```
  Chrome blocks `fetch` from `file://`. So either serve the folder (`python3 -m http.server` inside `shapla-chattar/`) or use `data:audio/mpeg;base64,...` strings as the values.
- **Spatial sound.** Voices play only when their speaker is on screen. Volume depends on how far the speaker is from the screen centre and how far you are zoomed in. Stereo pan follows where the speaker is on screen.

## 2. Export spec (applies to every file)

| | Voices | One-shot SFX | Ambience loops |
|---|---|---|---|
| Channels | mono | mono | stereo |
| Length | 1–4 s | 0.2–1.5 s | 30–60 s, loops without a seam |
| Head and tail silence | under 80 ms | under 30 ms | none; crossfade the ends |
| Level | about −16 LUFS, peaks under −3 dBFS | peaks under −3 dBFS | about −24 LUFS |
| Sample rate | 44.1 or 48 kHz | 44.1 or 48 kHz | 44.1 or 48 kHz |

Record voices dry, with no reverb. The scene places them in space. Make 2–3 takes of every hawker call and bus-helper shout, because those repeat most often.

---

## 3. Master direction (paste once as the style or system prompt)

> You are voicing real people on the street at Shapla Chattar, Motijheel, the banking district of Dhaka, Bangladesh. Speak colloquial Dhaka Bangla, not newsreader Bangla (*shuddho*). Keep the everyday contractions: *dimu*, *korteschi*, *khaiya*, *korsi*, *paisi*. Every line is shouted or spoken outdoors over traffic, horns and rickshaw bells, so project the voice while keeping it natural. Hawkers use the sing-song, repeated rhythm of Dhaka street calls: stretch the vowels, and the pitch rises then drops on the price. Bus helpers are hoarse young men who shout all day. The tone is warm, busy and good-humoured, never theatrical or cartoonish. Keep each line short and pass straight to the next beat. No music, no reverb, no background noise.

For models that take inline audio tags (such as ElevenLabs v3), you can prefix lines with tags like `[shouting]`, `[sing-song]`, `[tired]`, `[laughing]`, `[on the phone]`. The delivery notes in section 5 suggest which to use.

---

## 4. Cast (voice-design prompts)

Each voice ID below is reused for several lines. Design each voice once, then generate every line for that voice with the same settings.

| Voice ID | Character | Voice-design prompt |
|---|---|---|
| `V_MURI` | Kashem, jhalmuri seller, 55 | Bangladeshi man in his mid-fifties from Old Dhaka. Raspy, nasal street voice from decades of calling out. Sing-song hawker rhythm, rolled *r*, stretched vowels, drops pitch on the price. Friendly and sly. |
| `V_CHA` | Rahim "mama", tea-stall owner, 38 | Bangladeshi man in his late thirties. Warm, quick, slightly husky voice. Talks while pouring tea; teasing, familiar, calls everyone *mama*. Light Dhaka accent. |
| `V_HAWK` | General hawkers (fuchka, coconut, peanuts, paper, covers, books, shoe polish) | Bangladeshi man, 30–50, loud outdoor voice with a clipped rhythmic street call, slightly hoarse. Generate two versions of this voice (one higher, one lower) so the hawkers don't all sound alike. |
| `V_TEEN` | Water seller, looks about 14 | Energetic young Bangladeshi voice with a bright, cracking, high tone, running between buses. Design it as a youthful-sounding adult voice; don't clone a real child. |
| `V_HELPER` | Rubel, bus helper, 19 | Bangladeshi man, nineteen, voice hoarse and cracked from shouting all day. Very fast, clipped, urgent. Slaps the bus while he shouts. Uses bus slang (*ostad*, *plastic*, *ladies*). |
| `V_PULLER` | Babul, rickshaw puller from Rangpur, 45 | Bangladeshi man in his mid-forties with a northern (Rangpur) lilt. Tired, low, breathy, economical with words. Short sentences, a bit stubborn when bargaining. |
| `V_SALMA` | Salma, office passenger, 32 | Bangladeshi woman, early thirties, bank employee. Clear, brisk urban Dhaka voice, polite but firm when bargaining. |
| `V_POLICE` | Traffic sergeant, 42 | Bangladeshi man, forties. Commanding, sharp, clipped bark over traffic. Short phrases. |
| `V_OFFICE` | Office worker on the phone, 34 | Bangladeshi man, thirties, walking fast and slightly out of breath. Anxious and apologetic on the phone. Urban Dhaka accent. |
| `V_PEON` | Office peon, 56 | Bangladeshi man, fifties. Soft, deferential, slightly breathless after climbing stairs. |
| `V_AUNTY` | Woman in the ATM queue, 45 | Bangladeshi woman, mid-forties. Firm, no-nonsense, a little irritated, speaks up so the man can hear. |
| `V_GUARD` | Security guard, 62 | Bangladeshi man in his sixties. Gravelly, tired but officious. Sits on a plastic chair all day. |
| `V_TEA_A` | Tea-stall talker A, 50 | Bangladeshi man, fifty, relaxed and chatty. Enthusiastic about cricket. |
| `V_TEA_B` | Tea-stall talker B, 58 | Bangladeshi man, late fifties. Grumbling, humorous, sighs at prices. |
| `V_PHONE` | Garment worker on the phone, 24 | Bangladeshi woman, twenties, from a village in the north now working in Dhaka. Warm and tender speaking to her mother, slightly loud because of the street. |
| `V_PASSER` | Passer-by | Any adult Bangladeshi voice, startled and laughing as the rain starts. |

---

## 5. Line sheet

Generate every line below. The Bangla script is what the model should read. The romanisation helps with pronunciation and with models that struggle with the script.

### Hawkers

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `hawker_jhalmuri_1` | V_MURI | ঝালমুড়ি! ঝালমুড়ি! দশ টাকা, দশ টাকা! | Jhalmuri! Jhalmuri! Dosh taka, dosh taka! | Jhalmuri! Ten taka! | `[sing-song]` Stretch "muuuri"; the second "dosh taka" drops low. 3 takes. |
| `hawker_jhalmuri_2` | V_MURI | ঝাল বেশি দিমু, না কম? | Jhal beshi dimu, na kom? | More chilli or less? | Close range, friendly, to one customer. |
| `hawker_tea_1` | V_CHA | চা! গরম চা! আদা চা, রং চা! | Cha! Gorom cha! Ada cha, rong cha! | Tea! Hot tea! Ginger tea, black tea! | `[sing-song]` Quick and bright, calling to passers-by. 3 takes. |
| `hawker_tea_2` | V_CHA | মামা, চিনি কম না বেশি? | Mama, chini kom na beshi? | Mama, less sugar or more? | Teasing and warm, while pouring. |
| `hawker_fuchka_1` | V_HAWK | ফুচকা! চটপটি! টক-ঝাল-মিষ্টি! | Fuchka! Chotpoti! Tok-jhal-mishti! | Fuchka! Chotpoti! Sour, spicy, sweet! | Rhythmic, three beats on "tok-jhal-mishti". 2 takes. |
| `hawker_dab_1` | V_HAWK | ডাব! ঠান্ডা ডাব! পঞ্চাশ টাকা! | Dab! Thanda dab! Ponchash taka! | Coconut! Cool coconut! Fifty taka! | Punchy; the dao-chop sound goes in a separate SFX. |
| `hawker_badam_1` | V_HAWK | বাদাম! গরম বাদাম! টাটকা বাদাম! | Badam! Gorom badam! Tatka badam! | Peanuts! Hot peanuts! Fresh peanuts! | Walking and calling, slight bounce. 2 takes. |
| `hawker_paper_1` | V_HAWK | আজকের পত্রিকা! তাজা খবর, তাজা খবর! | Ajker potrika! Taja khobor, taja khobor! | Today's paper! Fresh news! | Morning energy, fast. |
| `hawker_cover_1` | V_HAWK | মোবাইল কভার! যেকোনো একটা একশো! | Mobile cover! Jekono ekta eksho! | Phone covers! Any one for a hundred! | Salesy and confident. |
| `hawker_book_1` | V_HAWK | বই নেন আপা, অর্ধেক দামে! | Boi nen apa, ordhek dame! | Take a book, apa, half price! | Persuasive, aimed at a woman passing. |
| `hawker_shoe_1` | V_HAWK | জুতা পালিশ! জুতা পালিশ! | Juta palish! Juta palish! | Shoe polish! | Low, steady, repeated while squatting. |
| `hawker_fruit_1` | V_HAWK | আপেল, কমলা, আঙুর! কেজি দুইশো! | Apel, komola, angur! Keji duisho! | Apples, oranges, grapes! 200 a kilo! | `[sing-song]` Loud, drawn out on "angur". 2 takes. |
| `hawker_cloth_1` | V_HAWK | যেটা নিবেন দেড়শো! বাইছা লন, বাইছা লন! | Jeta niben dedsho! Baiccha lon, baiccha lon! | Any piece, 150! Pick and choose! | `[shouting]` Classic footpath clothes call, clapping rhythm. 3 takes. |
| `hawker_singara_1` | V_HAWK | গরম গরম সিঙ্গারা, সমুচা! পাঁচ টাকা! | Gorom gorom singara, somucha! Pach taka! | Hot singara and samosa! Five taka! | Bright, over the sizzle of oil. |
| `hawker_akh_1` | V_HAWK | আখের রস! ঠান্ডা আখের রস! | Akher rosh! Thanda akher rosh! | Sugarcane juice! Cold! | Over the grinding press. |
| `hawker_peyara_1` | V_HAWK | পেয়ারা মাখা! ঝাল-লবণ দিয়া! | Peyara makha! Jhal-lobon diya! | Spiced guava! With chilli and salt! | Tempting, mouth-watering tone. |
| `hawker_sim_1` | V_HAWK | নতুন সিম! সাথে ফ্রি মিনিট! | Notun SIM! Shathe free minute! | New SIM! Free minutes with it! | Salesman patter, quick. |
| `hawker_attar_1` | V_HAWK | আতর, টুপি, জায়নামাজ! আসেন ভাই! | Atar, tupi, jaynamaz! Ashen bhai! | Attar, prayer caps, prayer mats! Come, bhai! | Soft, inviting; outside Baitul Mukarram. |
| `hotel_call_1` | V_TEEN | আসেন ভাই, গরম ভাত, গরুর মাংস, ডাল! | Ashen bhai, gorom bhat, gorur mangsho, dal! | Come in! Hot rice, beef curry, dal! | Hotel boy at a Kamalapur eatery, fast patter. 2 takes. |
| `kid_water_1` | V_TEEN | পানি! ঠান্ডা পানি! দশ টাকা! | Pani! Thanda pani! Dosh taka! | Water! Cold water! Ten taka! | `[shouting]` Bright, running between buses. 2 takes. |

### Bus helpers

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `helper_gulistan_1` | V_HELPER | গুলিস্তান! গুলিস্তান! খালি গাড়ি, খালি গাড়ি! | Gulistan! Gulistan! Khali gari, khali gari! | Gulistan! Empty bus! (It isn't.) | `[shouting]` Machine-gun fast, hoarse. 3 takes. |
| `helper_kamalapur_1` | V_HELPER | কমলাপুর! সায়েদাবাদ! উঠেন, উঠেন! | Kamalapur! Sayedabad! Uthen, uthen! | Kamalapur! Sayedabad! Get on! | `[shouting]` Urgent, waving people in. 2 takes. |
| `helper_aste_1` | V_HELPER | আস্তে! লেডিস! আস্তে! | Aste! Ladies! Aste! | Slow! Ladies boarding! | Shouted to the driver, protective. |
| `helper_ostad_1` | V_HELPER | ওস্তাদ, বাঁয়ে প্লাস্টিক! যান, যান! | Ostad, baye plastic! Jan, jan! | Boss, clear on the left! Go! | Classic helper slang; slap the bus on "jan, jan". |
| `helper_namen_1` | V_HELPER | মতিঝিল! মতিঝিল নামেন! | Motijheel! Motijheel namen! | Motijheel! Get off! | Loud, clipped. |
| `helper_pechone_1` | V_HELPER | পিছনে যান, পিছনে খালি! | Pichone jan, pichone khali! | Move to the back, the back is empty! | `[shouting]` Pushing passengers inside. |
| `helper_vara_1` | V_HELPER | ভাড়া দেন, ভাড়া! ভাংতি দেন ভাই! | Bhara den, bhara! Bhangti den bhai! | Fare, please! Small notes, brother! | Moving through a packed bus, impatient. |

### Rickshaw bargaining (one scripted scene, keep the timing tight)

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `rickshaw_ask_1` | V_SALMA | মামা, যাবেন? কমলাপুর। | Mama, jaben? Kamalapur. | Mama, will you go? Kamalapur. | Brisk, in a hurry. |
| `rickshaw_price_1` | V_PULLER | ষাট টাকা দিয়েন। | Shaat taka diyen. | Give sixty taka. | `[tired]` Flat, not looking up. |
| `rickshaw_bargain_1` | V_SALMA | চল্লিশ দিমু, চলেন। | Chollish dimu, chalen. | I'll give forty. Let's go. | Firm, half-smiling. |
| `rickshaw_ok_1` | V_PULLER | আচ্ছা উঠেন, পঞ্চাশ দিয়েন। | Accha uthen, ponchash diyen. | Okay, get on. Give fifty. | Resigned sigh first. |
| `rickshaw_side_1` | V_PULLER | সাইড! সাইড দেন! | Side! Side den! | Side! Give way! | `[shouting]` Over traffic, with the bell. |
| `rain_2` | V_PULLER | পলিথিন দিমু? বিশ টাকা বেশি। | Polithin dimu? Bish taka beshi. | Want the plastic sheet? Twenty extra. | Opportunistic, a little cheeky. |

### Traffic police

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `police_stop_1` | V_POLICE | এই! থামেন! থামেন! | Ei! Thamen! Thamen! | Hey! Stop! Stop! | Sharp bark, right after the whistle. |
| `police_side_1` | V_POLICE | এই রিকশা! সাইডে যা, সাইডে! | Ei rickshaw! Saide ja, saide! | Hey rickshaw! Move aside! | Constable with a stick, barking. |
| `police_go_1` | V_POLICE | যান, যান, তাড়াতাড়ি! | Jan, jan, taratari! | Go, go, quickly! | Waving traffic through, impatient. |

### Office and bank life

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `office_late_1` | V_OFFICE | ভাই, মিটিং শুরু হয়ে গেছে? আমি রাস্তায়! | Bhai, meeting shuru hoye geche? Ami rastay! | Has the meeting started? I'm on the road! | `[on the phone]` Out of breath, walking fast. |
| `office_file_1` | V_PEON | স্যার, ফাইলটা সই করায়া আনছি। | Sir, file-ta shoi koraya anchi. | Sir, I got the file signed. | Deferential, a bit breathless. |
| `office_lunch_1` | V_OFFICE | চলেন, মায়ের দোয়ায় খাইয়া আসি। | Cholen, Mayer Doay khaiya ashi. | Come, let's eat at Mayer Doa. | Relaxed, lunch-hour mood. |
| `bank_queue_1` | V_AUNTY | লাইনে দাঁড়ান ভাই, সবাই অপেক্ষা করতেছে। | Laine daran bhai, shobai opekkha kortese. | Stand in line, everyone is waiting. | Firm and irritated, raised voice. |
| `guard_1` | V_GUARD | এইখানে বাইক রাখা যাবে না! | Eikhane bike rakha jabe na! | You can't park the bike here! | Gravelly, officious. |
| `phone_1` | V_PHONE | হ্যাঁ আম্মা, বেতন পাইছি, বিকালে টাকা পাঠাইতেছি। | Hya Amma, beton paisi, bikale taka pathaitesi. | Yes Amma, got my salary, sending money this afternoon. | `[on the phone]` Warm, reassuring. |

### Tea-stall talk

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `tea_chat_1` | V_TEA_A | কালকে খেলা দেখছেন? কী একটা ম্যাচ! | Kalke khela dekhchen? Ki ekta match! | Did you see the game yesterday? What a match! | Excited, leaning in. |
| `tea_chat_2` | V_TEA_B | বাংলাদেশ এইবার জিতবোই। | Bangladesh eibar jitboi. | Bangladesh will win this time for sure. | Wry but hopeful. |
| `tea_chat_3` | V_TEA_B | জিনিসপত্রের যা দাম, বাঁচা দায়! | Jinishpotrer ja dam, bacha dai! | With prices like these, it's hard to get by! | Sigh, then grumble. |
| `tea_chat_4` | V_TEA_A | মামা, আরেক কাপ দেন, দুধ চা। | Mama, arek cup den, dudh cha. | Mama, one more cup. Milk tea. | Calling across the counter. |

### Jam and the club ground

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `passer_jam_1` | V_OFFICE | এই জ্যামে আজকে আর অফিস যাওয়া হইলো না! | Ei jame ajke ar office jawa hoilo na! | With this jam, I'm not making it to office today! | Exasperated sigh, half laughing. |
| `player_pass_1` | V_TEEN | পাস দে! পাস দে! | Pass de! Pass de! | Pass it! Pass it! | `[shouting]` Across the club ground, breathless. |
| `player_goal_1` | V_TEEN | গোওওল! | Gooool! | Goooal! | `[shouting]` Long joyful cry. 2 takes. |

### Kamalapur, schools and the snatcher

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `coolie_1` | V_PULLER | কুলি লাগবে? কুলি! মাল তুলে দিমু! | Kuli lagbe? Kuli! Mal tule dimu! | Need a porter? I'll carry your bags! | Red-shirted railway coolie, hustling. |
| `guardian_1` | V_AUNTY | এই রাফি, এদিকে আসো! টিফিন খাইছো? | Ei Rafi, edike asho! Tiffin khaicho? | Rafi, come here! Did you eat your tiffin? | Mother at the Ideal School gate, loving but loud. |
| `pupil_1` | V_TEEN | আম্মু, আইসক্রিম কিনে দাও না! | Ammu, icecream kine dao na! | Ammu, please buy me an ice cream! | Whiny child after school. |
| `snatch_victim_1` | V_SALMA | ছিনতাই! ছিনতাই! ধরেন! ধরেন! | Chhintai! Chhintai! Doren! Doren! | Snatcher! Catch him! | `[shouting]` Panicked scream. |
| `chase_1` | V_OFFICE | ধর! ধর! ওই যে দৌড়ায়! | Dhor! Dhor! Oi je dauray! | Get him! There he runs! | `[shouting]` Running, breathless. |
| `chase_giveup_1` | V_TEA_B | গেল তো গেল, আর পাওয়া যাইবো না। | Gelo to gelo, ar paowa jaibo na. | Gone is gone, you won't get it back. | Resigned sigh. |

### Rain

| ID | Voice | Bangla | Romanised | English | Delivery |
|---|---|---|---|---|---|
| `rain_1` | V_PASSER | বৃষ্টি আসছে! দৌড়ান! | Brishti ashche! Douran! | Rain's coming! Run! | `[laughing]` Startled and laughing. 2 takes (one male, one female). |

---

## 6. Sound effects (for a sound-effects model)

| ID | Prompt |
|---|---|
| `sfx_rickshaw_bell` | Close-up Dhaka cycle-rickshaw bell: bright thumb-flicked brass bell, two or three quick rings (tring-tring), dry, no background. |
| `sfx_horn_bus` | Loud Bangladeshi bus pressure horn: musical, slightly out-of-tune two- or three-note air horn, about 0.7 s, recorded on the street. |
| `sfx_horn_car` | Short car horn, two quick honks, mid-size sedan, dry. |
| `sfx_horn_cng` | CNG auto-rickshaw horn: small, nasal, high-pitched beep-beep, tinny. |
| `sfx_horn_bike` | 125cc motorbike horn: short, high, single or double beep. |
| `sfx_whistle` | Traffic police whistle: one long shrill pea-whistle blast then a short one, outdoors. |
| `sfx_crow` | House crow (*Corvus splendens*) caw, two harsh calls, close. |
| `sfx_train_horn` | Diesel locomotive two-tone horn at a big station, two long blasts, slight echo from a concrete roof. |
| `sfx_bus_slap` | Flat palm slapping the metal side of a bus twice (thap-thap), boomy sheet-metal thud. |

## 7. Ambience loops

| ID | Prompt |
|---|---|
| `amb_city` | 60-second seamless loop of a busy Dhaka roundabout at midday: dense traffic rumble, distant overlapping horns, rickshaw bells, murmur of crowds, occasional far-off hawker calls. No close-up voices. |
| `amb_rain` | 45-second seamless loop of heavy monsoon rain on asphalt and tin awnings, water gushing from gutters, muffled traffic. |
| `amb_night` | 60-second seamless loop of a Dhaka street at night: sparse traffic, crickets, a distant dog, a generator hum, faraway horn. |
| `amb_azan` | **Don't generate this one.** The call to prayer is sacred; use a real, properly licensed field recording of a distant azan. The scene plays it only if you supply the file. |

---

## 8. Checklist

- [ ] 16 voices designed (section 4)
- [ ] 56 lines generated, with 2–3 takes for hawker calls and helper shouts
- [ ] 9 SFX and 3 ambience loops (`amb_azan` optional, real recording only)
- [ ] Files named exactly by ID, trimmed, levelled
- [ ] Dropped into the scene with **Voices**, or listed in `voices/voices.js`
