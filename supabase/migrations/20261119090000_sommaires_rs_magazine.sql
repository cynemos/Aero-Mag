-- Sommaires des RS Magazine déjà inscrits, repris des pages archivées de rsmagazine.fr

-- (public/sommaires/rs-magazine.json). Seules les fiches sans description sont complétées.

UPDATE public.magazines SET description = $s$Sommaire
- 24 HEURES DU MANS • A 2 heures de l'arrivée, la 919 Hybrid était en tête !
- NEWS • Toute l'actualité Porsche
- COURRIER • La parole aux lecteurs
- COMPETITION • Porsche Carrera Cup, le meeting d'Imola
- MINIATURES • Les Porsche en réduction
- ESSAI • 997 Carrera 4 GTS, la 997 idéale ?
- DOSSIER OCCASION “CABRIOLET/TARGA” • 20 Porsche découvrables à moins de 35 000 € : 911 T Targa (2.0 l/2.2 l/2.4 l) - 911 Série G Targa (2.7 l/SC/Carrera 3.2 l) - 911 série G cabriolet (SC/Carrera 3.2 l) - 964 Targa - 964 cabriolet (Carrera 2/Carrera 4) - 996 3.4 l cabriolet (Carrera/Carrera 4) - 996 3.6 l cabriolet (Carrera/Carrera 4) - 996 Targa - Boxster 986 (2.5 l/2.7 l 220 ch/2.7 228 ch) - Boxster 986 S (252 ch/260 ch) - Boxster 987 phase I (Boxster/Boxster S) - 944 S2 - 944 Turbo cabriolet - 968 cabriolet - 914 (1.7 l/1.8 l/2.0 l/6 cylindres)
- TEMOIGNAGE • La 993 Carrera S Vésuvio vu par un propriétaire
- CLASSIC • 911 2.2 T : une des Classic les plus abordable
- PERSONNALISATION • Cayman “Monceniso by Studiotorino”
- COTE • Chaque mois, la cote actualisée de toutes les Porsche d'occasion
- MEETING CLUB • Le Rallye des Routes de France 2014
- MEETING CLUB • Le rallye des Clubs 2014
- CLUB • Les calendriers 2014
- ANNONCES • 1000 Porsche d'occasion

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 157
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au menu de ce numéro 69, paru en mars 2007, vous pourrez savourer entre autres, un match 997 GT3 vs 997 GT3 RS, l'essai des nouveaux Cayenne, une préparation Ruf Rt 12, un sujet technique Carrera 2.7 vs Carrera 3.0, un match 993 Carrera 285 ch vs 996 Carrera 300 ch entre 37 et 39 000 €...

Sommaire
- News (p. 4) • By RS magazine
- Miniatures (p. 8) • Les nouveautés du mois
- Courrier (p. 10) • La parole aux lecteurs
- Match (p. 14) • 997 GT3 vs 997 GT3 RS
- Essai nouveauté (p. 22) • Nouveaux Cayenne
- Match Occasion (p. 30) • 37 / 39 000 € – 993 Carrera 285 ch vs 996 Carrera 300 ch
- Préparation (p. 40) • Ruf Rt 12
- Club Porsche de France (p. 46) • 2007, l’année de tous les challenges
- Technique (p. 52) • Carrera 2.7 vs Carrera 3.0
- Interview (p. 58) • Louis Meznarie
- Classic (p. 62) • 912
- Pilotage (p. 68) • Le circuit de Magny-Cours
- Avocat (p. 70) • La jurisprudence
- Les Clubs (p. 72) • Les programmes 2007
- La cote RS Mag (p. 74) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 69
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Sommaire
- SALON • Epoqu’Auto fête les 50 ans de la 911
- NEWS • Toute l’actualité Porsche
- COURRIER • La parole aux lecteurs
- NOUVEAUTE • Les trois versions du Macan, de A à Z
- NOUVEAUTE • La Panamera Turbo S
- COMPETITION • La Carrera Cup au Castellet
- HISTOIRE • 1985 : la rétro de Porsche aux 24 Heures du Mans
- SHOPPING • 40 idées cadeau Porsche pour Noël
- ESSAI • Le test vérité du Cayman S engagé en Rallye
- GUIDE D’ACHAT “LES MEILLEURS RAPPORTS PRIX/PLAISIR” • DE 20 000 à 100 000 €, ces Porsche qui vous en offrent pour votre argent : 911 2.0 T – 911 Carrera 3.2 TL – 964 Turbo II 3.3 • 993 Carrera 4S – 996 GT3 phase I – 996 Turbo – 997 Carrera 4S cabriolet – 997 Carrera GTS – 991 Carrera cabriolet – Boxster S 260 ch – Cayman R
- ENTRETIEN • Franck Walliser, chef du développement de la 918 Spyder
- CENTRE PORSCHE • La Rochelle a la fibre écolo
- TEMOIGNAGE • La 964 Carrera cabriolet Tiptronic vu par un propriétaire
- CLASSIC • 356 A Speedster
- CLUB • Les calendriers 2013
- COTE • Chaque mois, la cote actualisée de toutes les Porsche d’occasion
- ANNONCES • 1000 Porsche d’occasion

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 149
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Sommaire
- NOUVEAUTE • 991 Targa 4 et 4S
- NEWS • Toute l’actualité Porsche
- COURRIER • La parole aux lecteurs
- 1ER ESSAI • La 991 GT3 Cup passe aux palettes !
- HISTOIRE • 1987 : la rétro de Porsche aux 24 Heures du Mans
- COMPETITION • La Porsche Carrera Cup fête ses champions
- MINIATURES • Les Porsche en réduction
- DOSSIER “L’HISTOIRE DE LA TARGA, TOUS LES MODELES” • Les Targa avec Arceau : Classic, Youngtimer, 964 – Les Targa avec toit en verre : 993, 996, 997
- GUIDE OCCASION • La 996 Turbo : histoire, motorisation, équipements, essais, nos conseils d’achat…
- COLLECTOR • La 911 Carrera 3.2 Speedster TL
- TEMOIGNAGE • La 997 GT3 phase I vu par un propriétaire
- 2014, TOUTE LA GAMME PORSCHE DECRYPTÉE • Boxster, Cayman, 991, Panamera, Cayenne, Macan
- CLUB • Les calendriers 2014
- COTE • Chaque mois, la cote actualisée de toutes les Porsche d’occasion
- ANNONCES • 1000 Porsche d’occasion

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 152
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Sommaire
- NOUVEAUTE • Boxster et Cayman GTS : les gènes du sport
- NEWS • Toute l'actualité Porsche
- COURRIER • La parole aux lecteurs
- 24 HEURES DU MANS • La 919 en piste
- HISTOIRE • 1997 : la rétro de Porsche aux 24 Heures du Mans
- COMPETITION • Porsche Carrera Cup, les essais du Castellet
- MINIATURES • Les Porsche en réduction
- 1ER ESSAI • 991 Targa 4 et 4S, le grand retour de l'arceau !
- PRATIQUE • Faut-il avoir peur de la 993 Turbo ?
- TEMOIGNAGE • La 911 Carrera 3.2 Targa vu par un propriétaire
- CLASSIC • 356 pré-A cabriolet 1951-
- DOSSIER OCCASION • 996 Carrera 3.4 cabriolet : tout savoir pour bien acheter
- RENCONTRE • Harald Wagner, l'inventeur de la marque “Targa”
- MATCH OCCASION • Boxster 2.5 ou 2.7 ? Des “mini prix” qui font le maximum
- AVENTURE • Le tournage de Speed Merchants
- COTE • Chaque mois, la cote actualisée de toutes les Porsche d'occasion
- CLUB • Les calendriers 2014
- ANNONCES • 1000 Porsche d'occasion

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 155
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Paru en novembre 2009, vous pourrez découvrir dans ce numéro, l' essai 997 Turbo phase II, un voyage, le tour d’Australie en Panamera, une préparation avec une 964 Carrera 4 look 3.0 RSR, un essai de la 930 Turbo boîte 5
l'essai de la 996 Carrera 3.6 cabriolet, un dossier sur sur le marché de la 997 phase I, et en classic la 911 2.4 T Targa...

Sommaire
- Club Porsche (p. 4) • Meeting d’Albi
- News (p. 8) • Festival Porsche
- News (p. 12) • By RS magazine
- Miniatures (p. 22) • Les nouveautés du mois
- News (p. 24) • L’histoire des protos avec Benoît Couturier
- Compétition (p. 26) • La chronique d’Anthony Beltoise
- Courrier (p. 28) • La parole aux lecteurs
- Essai (p. 30) • 997 Turbo phase II
- Voyage (p. 40) • Le tour d’Australie en Panamera
- Préparation (p. 48) • 964 Carrera 4 look 3.0 RSR
- Essai (p. 54) • 930 Turbo boîte 5
- Essai (p. 60) • 996 Carrera 3.6 cabriolet
- Dossier (p. 66) • Le point sur le marché de la 997 phase I
- Classic (p. 72) • 911 2.4 T Targa
- Clubs (p. 78) • Tous les calendriers 2009
- Clubs (p. 80) • Meeting Porsche/Harley
- Juridique (p. 82) • Questions des lecteurs
- Pilotage (p. 83) • Questions sur la restion du poids
- La cote RS Mag (p. 84) • Remise à jour chaque mois > L'image du mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 101
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au programme de ce numéro 77 de RS paru en octobre, un zoom sur un Cayenne rallongé, le premier essai de la 997 GT2, un match occasion 993 Carrera 4S vs 996 Carrera 4S, l'essai d'une 911 Carrera 3.0, l'essai d'une 911 Carrera 2.9 RS, à la rencontre de la 997 Turbo cabriolet...

Sommaire
- Zoom (p. 4) • Cayenne rallongé
- Salon (p. 6) • Geneva Classics
- Actualité (p. 8) • La Cayman Cup arrive en France
- News (p. 14) • By RS magazine
- Miniatures (p. 20) • Les nouveautés du mois
- Courrier (p. 22) • La parole aux lecteurs
- Premier essai (p. 26)
- 997 GT2
- Match occasion (p. 32) • 50 / 60 000 € – 993 Carrera 4S vs 996 Carrera 4S
- Meeting (p. 42) • Classic Tour
- Guide pratique (p. 46) • 964 Anniversaire
- Evénement (p. 54) • A la rencontre de la 997 Turbo cabriolet
- Essai (p. 60) • 911 Carrera 3.0
- Classic (p. 66) • 911 Carrera 2.9 RS
- Pratique (p. 74) • Les cameras embarquées
- Juridique (p. 76) • Les problèmes des lecteurs
- Pilotage (p. 78) • Le circuit de Pau Arnos
- Les Clubs (p. 80) • Les programmes 2007
- La cote RS Mag (p. 82) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 77
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Paru en juillet 2008, ce numéro 85 de RS Magazine vous proposait entre autres, les premiers essais des 997 Carrera et Carrera S Phase II, l'essai d'une 964 Turbo S Leichbau, la préparation d'une Cayman LM Racing, l'essai de la 996 GT3, un match 993 Motorsport cab’ vs 993 Carrera S X51, et bien d'autres reportages encore...

Sommaire
- Zoom (p. 4) • 24 Heures du Mans 2008
- Club Porsche Motorsport (p. 8) • Les courses d’Albi
- News (p. 12) • By RS magazine
- News (p. 18) • L’histoire des protos avec Benoît Couturier
- Miniatures (p. 20) • Les nouveautés du mois
- Courrier (p. 22) • La parole aux lecteurs
- Premier essai (p. 26) • 997 Carrera / Carrera S Phase II
- Essai (p. 36) • 964 Turbo S Leichbau
- Préparation (p. 44) • Cayman LM Racing
- Rallye (p. 50) • Les Routes de France
- Essai (p. 54)
- 996 GT3
- Match (p. 60) • 993 Motorsport cab’ vs 993 Carrera S X51
- Classic (p. 68) • 911 2.0 S injection
- Juridique (p. 74) • Les questions des lecteurs
- Les Clubs (p. 76) • Les programmes 2008
- La cote RS Mag (p. 78) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 85
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Paru en avril 2006,ce RS n° 58 vous proposait (entre autres sujets) un scoop sur la 917 GT, en nouveauté la 997 GT3, un retour sur le salon de Genève 2006, un essai de la 964 cabriolet Turbo Look, un sujet sur les couleurs Porsche avec des 993 Carrera 4S, une rencontre avec la 911 SCR, un dossier sur le marché de l'occasion....

Sommaire
- Scoop (p. 4)
- 917 GT
- Nouveauté (p. 6)
- 997 GT3
- Salon (p. 12) • Genève 2006
- News (p. 16) • By RS magazine
- Miniatures (p. 20) • Les nouveautés du mois
- Courrier (p. 22) • La parole aux lecteurs
- Essai (p. 28) • 964 cabriolet Turbo Look
- Spécial couleurs (p. 36) • 993 Carrera 4S
- Rencontre (p. 40)
- 911 SCR
- Dossier (p. 46) • Le marché de l’occasion
- Apprentissage (p. 56) • Stage GT Pilotage à Lurcy Levis
- Technique (p. 58) • Les secrets de la 997 turbo
- Classic (p. 66)
- 911 2.2 S
- Pilotage (p. 72) • L’équipement du pilote
- Les Clubs (p. 74) • Tous les programmes 2006
- La cote RS Mag (p. 76) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 58
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au menu de ce numéro 83 de RS Mag, paru en mai 2008, vous pourrez découvrir un dossier sur la pollution par le CO2, la visite d'usine au coeur de Porsche Motorsport, un essai extrême de la 997 GT3 RS avec Christophe Lapierre, un match 911 Carrera 3.2 Speedster vs 964 Speedster, un dossier occasion sur la 996 Carrera Tiptronic et bien d'autres sujets...

Sommaire
- Nouveauté (p. 4) • Les derniers secrets de la Panamera
- Club Porsche Motorsport (p. 6) • Premier roulage pour la 911 Legend Cup
- Salon (p. 8) • Techno Classica Essen
- News (p. 10) • La vérité sur la pollution par le CO2
- News (p. 12) • By RS magazine
- News (p. 16) • L’histoire des protos avec Benoît Couturier
- Miniatures (p. 18) • Les nouveautés du mois
- Courrier (p. 20) • La parole aux lecteurs
- Visite d’Usine (p. 28) • Au coeur de Porsche Motorsport
- Essai extrême (p. 34) • 997 GT3 RS avec Christophe Lapierre
- MATCH P.40 • 911 Carrera 3.2 – Speedster vs 964 Speedster
- Dossier occasion (p. 48) • 996 Carrera Tiptronic
- Essai (p. 56)
- 928 S
- Budget (p. 60) • 964 Carrera 4
- Rencontre (p. 66) • 993 Carrera S X51
- Classic (p. 72) • 908/3
- Technique (p. 80) • Les pneus pour toutes les Porsche
- Pratique (p. 82) • La décoration d’une voiture de course
- Pilotage (p. 84) • Le circuit du Luc
- Les Clubs (p. 86) • Les programmes 2008
- La cote RS Mag (p. 88) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 83
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Paru en octobre 2008, ce numéro 88 de RS mag vous propose un dossier occasion 964 Carrera 4, l'arrivée de la Panamera, en nouveauté le Cayenne Transsyberia, une personnalisation avec un Boxster GT2 9 One One, l'essai d'une 911 2.7 1975, la préparation d'une 993 S Turbo, en classic un match 906 vs 910 et bien d'autres sujets...

Sommaire
- Zoom (p. 4) • La Panamera
- Club Porsche Motorsport (p. 6) • Meeting de Magny-Cours
- Nouveauté (p. 10) • Cayenne Transsyberia
- News (p. 11) • By RS magazine
- News (p. 16) • L’histoire des protos avec Benoît Couturier
- Miniatures (p. 18) • Les nouveautés du mois
- Courrier (p. 20) • La parole aux lecteurs
- Enquête (p. 24) • Acheter une 997 phase I maintenant ?
- Personnalisation (p. 30) • Boxster GT2 9 One One
- Essai (p. 36) • 911 2.7 1975
- Préparation (p. 42) • 993 S Turbo
- Essai (p. 48) • 928 GTS boîte mécanique – DOSSIER OCCASION page 52 – 964 Carrera 4
- Meeting (p. 62) • Porsche Tour de l’Ile de Ré
- Classic (p. 66) • 906 vs 910
- Pratique (p. 74) • Le traitement Protech
- Pilotage (p. 76) • Le circuit de Bordeaux-Mérignac
- Les Clubs (p. 78) • Les programmes 2008
- La cote RS Mag (p. 80) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 88
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au menu de ce numéro 67 de RS Mag (janvier 2007) , vous pourrez découvrir le Cayenne II, l'ouverture d'un centre Porsche à Boulogne, l'essai nouveauté 997 4S Targa vs 997 4S cab, rencontre match entre une 914-6 face à une Cayman S, un dossier occasion 996 Carrera 3.6 et bien d'autres sujets encore...

Sommaire
- Nouveauté (p. 4) • Cayenne II
- Ouverture (p. 8) • Centre Porsche Boulogne
- News (p. 10) • By RS magazine
- Miniatures (p. 14) • Les nouveautés du mois
- Courrier (p. 16) • La parole aux lecteurs
- Essai nouveauté (p. 22) • 997 4S Targa vs 997 4S cab
- Rencontre (p. 30) • 914-6 vs Cayman S
- Dossier Occasion (p. 36) • 996 Carrera 3.6
- Occasion (p. 46) • 993 Carrera S Tiptronic S
- Legende (p. 50)
- 718 - RS60
- Guide pratique (p. 56) • 911 SC Targa
- Technique (p. 64) • Spoilers et ailerons 1972-1989
- Classic (p. 68) • Porsche de Chefs
- Pilotage (p. 74) • Le circuit de Folembray
- Avocat (p. 76) • La loi du 5 décembre 2006
- La cote RS Mag (p. 78) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 67
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Paru en août 2008, ce numéro 86 de RS consacrait un important dossier sur les 60 ans de la marque allemande, les dates clé, les plus belles Porsche de course, les Porsche mythiques, les Porsche atypiques, l’évolution de l’outil de production, mais aussi des essais, 997 Carrera S Phase II PDK, 997 Carrera S Phase II PDK, Boxster méca vs Boxster Tiptro...

Sommaire
- Nouveauté 4
- 997 Carrera 4 et 4S phase II
- Club Porsche Motorsport . 8
- Les courses du Castellet
- News . 12
- By RS magazine
- News . 16
- L’histoire des protos avec Benoît Couturier
- Miniatures . 18
- Les nouveautés du mois
- Courrier 20
- La parole aux lecteurs
- Essai . 24
- 997 Carrera S Phase II PDK
- Dossier 28
- Les Carrera 3.2 Turbo Look
- Match 38
- 997 Carrera S Phase II PDK
- Rencontre . 44
- 964 cabriolet
- Match 48
- Boxster méca vs Boxster Tiptro
- DOSSIER
- SPÉCIAL 60 ANS
- PAGE 54 • • Les dates clé – • Les plus belles Porsche de course – • Les Porsche mythiques – • Les Porsche atypiques – • L’évolution de l’outil de production – Pilotage . 74 – Le nouveau circuit du Val de Vienne – Les Clubs 76 – Les programmes 2008 – La cote RS Mag . 78 – Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 86
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au sommaire de ce numéro 40 de RS paru en octobre 2004,vous pouviez découvrir en avant première le nouveau Boxster, un sujet compétition sur la GT3 Rallye, un dossier occasion sur la 993 Carrera 4 de 272 ch, la préparation d'un Boxster turbo look, un match GT3 Cup ou encore un sujet pilotage sur la technique du talon pointe....

Sommaire
- News (p. 4) • By RS magazine
- Courrier (p. 8) • La parole aux lecteurs
- Avant première (p. 10) • Le nouveau Boxster – Sport .............2 0 – GT3 Rallye – Actualité ...........2 4 – Cayenne
- DOSSIER OCCASION
- 993 CARRERA 4 272 CH
- Préparation (p. 38) • Boxster turbo Look – Match .............4 4 – GT3 Cup
- Classique (p. 54) • 2.4 S Targa – Repères ............6 0 – 911 SC coupé
- Avocat (p. 64) • La vente à distance – Pilotage ............6 6 – Le talon-pointe
- CPF (p. 68)

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 40
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au programme de ce numéro 79 paru en janvier 2008, vous pourrez apprécier notamment, la présentation d'une GT3 Cup 2008, en nouveauté le Boxster RS60 Spyder, un reportage sur l'histoire des protos, un match occasion 911 Carrera 3.2 vs la 968 Clubsport, un guide pratique sur la 996 Carrera 3.6 cabriolet, et bien d'autres sujets...

Sommaire
- Présentation 4
- GT3 Cup 2008
- Nouveauté 6
- Boxster RS60 Spyder
- Gamme 2008 10
- Porsche Design Driver’s Selection
- Actualité 12
- Le Bonus/malus écologique appliqué aux Porsche
- News 14
- By RS magazine
- Histoire 20
- L’histoire des protos avec Benoît Couturier
- Miniatures 22
- Les nouveautés du mois
- Courrier 24
- La parole aux lecteurs
- Match occasion p. 28
- 911 CARRERA 3.2 VS 968 CLUBSPORT à 18/22 000 E
- Rencontre 38
- Boxster 2.5
- Guide pratique 42
- 996 Carrera 3.6 cabriolet
- Essai 50
- 993 “Sound Packet”
- Essai 54
- 964 Carrera 4
- Compétition 60
- Bilan saison 2007
- Classic 66
- 356 BT5 • Juridique 74 – Le nouveau contrôle technique – Pilotage 76 – Le circuit d’Albi – Les Clubs 78 – Toutes les adresses – La cote RS Mag 80 – Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 79
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au sommaire de ce numéro 98 de RS Mag notamment, le premier essai de la Panamera, une préparation 997 German Auto Center et une préparation d'une 911 Carrera 3.2 Turbo Look S, l'essai d'un 996 GT3, l'essai d'une 964 cabriolet, un reportage sur un proto, la 917 PA et d'autres sujets encore comme un dossier special sur les séries limitées...

Sommaire
- News (p. 4) • By RS magazine
- Miniatures (p. 10) • Les nouveautés du mois
- News (p. 12) • L’histoire des protos avec Benoît Couturier
- Club Porsche (p. 16) • Meeting du Castellet
- Compétition (p. 20) • La chronique d’Anthony Beltoise
- Courrier (p. 22) • La parole aux lecteurs
- Premier essai (p. 26) • Panamera
- Clubs (p. 38) • Classic Meeting
- Préparation (p. 40) • 997 German Auto Center
- Essai (p. 46)
- 996 GT3
- Préparation (p. 52) • 911 Carrera 3.2 Turbo Look S
- Essai (p. 56) • 964 cabriolet
- Dossier spécial (p. 60) • Toutes les Porsche en série limitée
- Proto (p. 76)
- 917 PA
- Meeting (p. 84) • Le concours à l’américaine
- Les clubs (p. 86) • Tous les calendriers 2009
- La cote RS Mag (p. 88) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 98
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au programme de ce numéro 117 de RS Mag, paru en mars 2011, vous pourrez découvrir en nouveauté 997 & Boxster Black Edition, en nouveautés la Panamera Hybrid, le Boxster E, l'essai de la Panamera TechArt GrandGT, de la 993 Carrera RS, l'essai de la 964 Carrera 2 Targa, un sujet sur la 996 Carrera 4S Exclusive, une préparation d'une 911 Carrera 3.0 RS...

Sommaire
- Actualité (p. 4) • Porsche Matmut Carrera Cup
- Nouveauté (p. 10) • 997 & Boxster Black Edition
- Nouveauté (p. 18) • Panamera Hybrid
- Nouveauté (p. 22) • Boxster E
- News (p. 24) • By RS magazine
- Miniatures (p. 30) • Les nouveautés du mois
- Courrier (p. 32) • La parole aux lecteurs
- Essai (p. 36) • Panamera TechArt GrandGT
- Essai (p. 42) • 993 Carrera RS
- Rencontre (p. 48) • 996 Carrera 4S Exclusive
- Essai d’époque (p. 54) • 964 Carrera 2 Targa
- Préparation (p. 60) • 911 Carrera 3.0 RS
- Youngtimer (p. 66) • 911 2.7 1975
- Enquête lecteurs (p. 72) • 997 Carrera phase I
- Classic (p. 80) • 356 Outlaw
- Interview (p. 88) • Frédéric Ancel / Arnaud Noël
- Clubs (p. 90) • Toutes les adresses
- La cote RS Mag (p. 92) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 117
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Paru en septembre 2007, ce numéro 75 de RS vous proposait en nouveauté la Cayman S Porsche Design, la découverte du Cayenne Hybride, un essai complet de la 997 Carrera 4 S, une préparation 911 SC look 3.0 RS, en rareté 3.6 Turbo S Flatnose, sans oublier un reportage sur les 30 ans de la 928...

Sommaire
- Nouveauté
- Cayman S Porsche Design Edition 1
- Classic Endurance Racing
- 1 000 km de Spa-Francorchamps
- News
- By RS Mag
- Miniatures
- Les nouveautés du mois
- Courrier
- La parole aux lecteurs
- Technique
- Au volant du Cayenne Hybride
- Exclusif
- 997 Carrera 4S
- Préparation
- 911 SC Look 3.0 RS
- Rareté
- 3.6 Turbo S Flatnose
- Anniversaire
- Les 30 ans de la 928
- Préparation
- 997 TechArt
- Classic
- 550 Spyder
- Pilotage
- Le circuit de Lédenon
- Les clubs
- Les programmes 2007
- La cote RS Mag

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 75
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au menu de ce numéro 92 de RS paru en février 2009, vous pourrez apprécier notamment l'avis des lecteurs sur la 964 Carrera, la visite du nouveau musée Porsche, un dossier spécial sur la gamme 2009, un essai de la 911 Carrera 3.2, l'essai de la Boxster S Tiptronic ou encore un retour sur la 911 2.4 S Targa...

Sommaire
- Actualité (p. 4) • Le Club Porsche Motorsport en 2009
- News (p. 8) • By RS magazine
- Scoop (p. 9) • Les futurs modèles
- News (p. 12) • L’histoire des protos avec Benoît Couturier
- Miniatures (p. 14) • Les nouveautés du mois
- Enquête lecteurs (p. 15) • 964 Carrera
- Courrier (p. 18) • La parole aux lecteurs
- Visite (p. 22) • Le nouveau musée Porsche
- Dossier gamme 2009 (p. 28)
- • Boxster (p. 30)
- • Cayman (p. 31)
- • 911 Carrera (p. 32)
- • Cayenne (p. 36)
- Spécial RS 92 (p. 38)
- • Essai (p. 40)
- • Budget (p. 44)
- • Utilisation (p. 46)
- • Guide d’achat (p. 48)
- • La 3.8 RSR du Mans 1994 (p. 50)
- Dossier Occasion (p. 56) • 911 Carrera 3.2
- Essai (p. 66) • Boxster S Tiptronic
- Classic (p. 70) • 911 2.4 S Targa
- Juridique (p. 78) • L’annulation du permis
- Les clubs (p. 80) • Toutes les adresses
- La cote RS Mag (p. 82) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 92
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$En août 2004 paraissait le RS numéro 38, dans lequele vous pouviez lire notamment un match entre une 964 Turbo S et une 993 GT2, l'essai d'une 993 Targa, mais aussi l'essai d'une rare Carrera 74 US, un guide d'achat de 54 Porsche entre 15 et 60 000 €, mais encore un sujet sur la 964 Carrera 4 Lightweight...

Sommaire
- News (p. 4) • By RS magazine
- Courrier (p. 6) • La parole aux lecteurs – Match .............1 0 – 964 Turbo S vs 993 GT2 – Essai ..............1 8 – 993 Targa – Rareté .............2 4 – Carrera 74 US
- GUIDE D’ACHAT • 54 PORSCHE À LA LOUPE de 15 000 à 60 000 € P.28 – Légende ............5 4 – 964 Carrera 4 Lightweight – Technique ..........5 8 – Les nouveautés de la 997 – Vente .............6 4 – Porsche Only
- CPF ...............6 6 • Rallye des Clubs – Avocat ............6 8 – Les conseils pour les vacances – Clubs ..............7 0 – Calendrier

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 38
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au programme de ce numéro 120 de RS Magazine, paru en juin 2011, vous pourrez découvrir en nouveauté la 997 Carrera 4 GTS, la Cayman S Black Edition et la Panamera diesel, l’essai de la Panamera S Hybrid et d’une voiture d’époque, la 964 Anniversaire, la personnalisation d’une 911 Look Speedster Classic, un dossier sur le prix de revient d’une 997 Turbo, un guide pratique de la 996 Carrera 3.4, la rencontre d’une 3.2 Speedster vs une 997 Speedster, un dossier d’occasion sur la 993…

Sommaire
- NOUVEAUTÉ • 997 Carrera 4 GTS
- NOUVEAUTÉ • Cayman S Black Edition
- NOUVEAUTÉ • Panamera diesel
- CARRERA CUP • Meeting de Nogaro
- NEWS • Toute l’actualité Porsche, GT FFSA
- MINIATURES • Les nouveautés du mois
- COURRIER • La parole aux lecteurs
- ANNIVERSAIRE • 80 ans du Bureau d’Etudes Porsche
- RENCONTRE • 3.2 Speedster vs 997 Speedster
- ESSAI • Panamera S Hybrid
- GUIDE PRATIQUE • 996 Carreara 3.4
- RALLYE • Rallye des Clubs
- PRIX DE REVIENT • 997 Turbo
- DOSSIER D’OCCASION • 993 cabriolet
- COMPÉTITION • 914 – 6 Groupe 4 au Tour Auto
- ESSAI D’ÉPOQUE • 964 Anniversaire
- PERSONNALISATION • 911 Look Speedster Classic
- LE JOUR OU • La première Porsche Hybride
- CLUBS PORSCHE MOTORSPORT • Meeting de Dijon
- CLUBS • Toutes les adresses
- LA COTE RS MAG • Chaque mois, les prix actualisés de toutes les Porsche

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 120
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Sommaire
- ESSAI NOUVEAUTE • Au volant des nouveaux Cayenne
- NEWS • Toute l’actualité Porsche
- COMPETITION • Porsche Carrera Cup, le meeting de Magny-Cours
- MINIATURES • Les Porsche en réduction
- DOSSIER SPECIAL “911 A AIR” • 
- >4 critères (A collectionner – Pour rouler au quotidien – Pour rouler plaisir – A restaurer)
- >4 tranches de prix (de moins de 25 000 € à plus de 50 000 €)
- >Le point sur les générations
- >Les choix de la rédaction
- NOUVEAU • 997 Sport Cup, pour débuter en compéition !
- DOSSIER OCCASION 997 CARRERA CABRIOLET PHASE II • Historique, équipement, motorisation, essai, cote… tous nos conseils d’achat pour soffrir un des meilleurs cab qui soit
- CLASSIC • Une 911 2.0 1965 dans un “jus” exceptionnel
- TEMOIGNAGE • Le Cayman R vu par un propriétaire
- MEETING CLUB • Le Porsche Club Motorsport à Magny-Cours
- CLUB • Les calendriers 2014
- ANNONCES • 1000 Porsche d’occasion
- COURRIER • La parole aux lecteurs
- COTE • Chaque mois, la cote actualisée de toutes les Porsche d’occasion

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 160
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au menu de ce numéro 96, paru en juin 2009, vous pourrez déguster l'essai de la 997 GT3 phase II, une préparation Turbo II 3.3 MCG, l'essai de la 996 Turbo, 993 Carrera S, l'essai de la 968 ClubSport, celui de la 996 Carrera 4S cabriolet et de la 911 Carrera 2.7 Targa, et pas moins de 800 km en 959...

Sommaire
- Actualité (p. 4) • RS meeting
- News (p. 12) • By RS magazine
- News (p. 16) • L’histoire des protos avec Benoît Couturier
- Miniatures (p. 18) • Les nouveautés du mois
- Compétition (p. 20) • La chronique d’Anthony Beltoise
- Courrier (p. 22) • La parole aux lecteurs
- Club Porsche (p. 28) • Meeting de Ledenon
- Essai (p. 34) • 997 GT3 phase II
- Préparation (p. 40) • Turbo II 3.3 MCG
- Essai (p. 46) • 996 Turbo
- Rencontre (p. 50) • Un homme, une Porsche
- Guide pratique (p. 54) • 993 Carrera S
- Essai (p. 62) • 968 ClubSport
- Essai (p. 66) • 996 Carrera 4S cabriolet
- Essai (p. 70) • 911 Carrera 2.7 Targa
- Supercar (p. 74) • 800 Km en 959
- Les clubs (p. 82) • Tous les calendriers 2009
- Club Porsche (p. 85) • Rallye des Clubs
- Juridique (p. 88) • Questions des lecteurs
- Musée (p. 89) • Le Musée des 24 Heures du Mans
- La cote RS Mag (p. 90) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 96
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Sommaire
- NOUVEAUTE • 919 Hybrid, Objectif le Mans !
- NEWS • Toute l’actualité Porsche
- COURRIER • La parole aux lecteurs
- SALON • Porsche et les préparateurs au salon de Genève
- HISTOIRE • 1996 : la rétro de Porsche aux 24 Heures du Mans
- COMPETITION • Porsche Carrera Cup, zoom sur la saison 2014
- MINIATURES • Les Porsche en réduction
- 1ER ESSAI • L’essai des 3 versions du Macan – Macan S/Macan Turbo/Macan Diesel
- DOSSIER SPECIAL “TENDANCE 2014 DU MARCHE DE L’OCCASION” 911/914/BOXSTER/CAYMAN : Tous les modèles à la loupe, les cotes à la hausse, les cotes à la baisse… tout savoir pour bien acheter
- MATCH • Panamera Hybrid vs Cayenne S Diesel, le duel des énergies “éco”
- TEMOIGNAGE • La 964 Turbo II 3.3 vu par un propriétaire
- CLASSIC • Découvrez les réserves secrètes du Musée Porsche
- CLUB • Les calendriers 2014
- COTE • Chaque mois, la cote actualisée de toutes les Porsche d’occasion
- ANNONCES • 1000 Porsche d’occasion

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 154
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au programme de ce numéro 39 de RS Mag, spécial Le Mans Classic, vous pourrez retrouver toute l'ambiance et tous les évenements de la course, toutes les Porsche engagées et leurs classements, des interviews, les grands moments de la course, bref, que du bonheur....

Sommaire
- Clic-Clac ..............p 28/29
- Les instantanés du Mans Classic
- Reportage .............p 30/49
- L’Espace Club
- La Course
- Les interviews :
- • Jürgen Barth
- • Patrick Peter
- • Jean-Pierre Pla
- • Anne Dungelhoeff
- Sensation .................p 50
- Le tour du grand circuit à bord de la 997
- Voyage ...............p 52/53
- Le week-end à bord de la 356 du président Pompidou
- Concours d’élégance . . . . . .p 54/55
- Les 16 Porsche primées par le CPF Classic et RS Magazine
- Clin d’oeil .................p 56
- Les Hollandais et leur “camping Porsche”
- Interview .............p 58/59
- Jacques Bertoni : « j’ai réalisé mon rêve de gosse à bord d’une 911 2.0 ! »
- >Les autos ..............p 62/83
- Les 63 Porsche en course
- >Le classement .............p 84
- Quels résultats pour les Porsche engagées ?

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 39
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Sommaire
- SUPPLEMENT GRATUIT • LE GUIDE PORSCHE MOTORSPORT 2014 :
- 24 pages pour tout connaître sur Porsche en compétition
- ESSAI NOUVEAUTES • Boxster et Cayman GTS : la chasse à la 911 est ouverte !
- NEWS • Toute l'actualité Porsche
- COURRIER • La parole aux lecteurs
- HISTOIRE • 1998 : la rétro de Porsche aux 24 Heures du Mans
- COMPETITION • Porsche Carrera Cup, le meeting du Mans
- MINIATURES • Les Porsche en réduction
- ESSAI • 993 Carrera X51 phase I : 285 chevaux méconnus
- GUIDE PRATIQUE • GENERATION 996 - LES PIEGES A EVITER
- Carrera, Carrera 4S, GT3, Turbo : comment réaliser un bon achat ?
- TEMOIGNAGE • La 991 Carrera 4S cabriolet vu par un propriétaire
- CLASSIC • 911 2.4 E Targa : du couple et du soleil, le compromis idéal ?
- DOSSIER OCCASION • 911 Carrera 3.2 cabriolet
- Histoire - Technique - Moteur - Equipement - Essai - Nos conseils
- ESSAI • 997 Turbo cabriolet phase II, les prix ont baissé, c'est le moment d'en profiter
- MAKING OFF “LE MANS” • Les coulisses du film culte
- COTE • Chaque mois, la cote actualisée de toutes les Porsche d'occasion
- CLUB • Les calendriers 2014
- ANNONCES • 1000 Porsche d'occasion

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 156
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au programme de ce numéro 100 de RS Mag, paru en octobre 2009, notamment la 997 Sport Classic, la 997 GT3 Cup, un voyage en Chine en 997 Carrera 4S, un comparatif avec 6 RS pour ses 35 ans, un comparatif Derek Bell au volant de la 908 et de la 917, un match Gamballa Mirage GT vs 9ff Carrera GT-T900, et bien d'autres sujets...

Sommaire
- Nouveauté (p. 4) • 997 Sport Classic
- Nouveauté (p. 10) • 997 GT3 Cup
- News (p. 18) • By RS magazine
- Miniatures (p. 28) • Les nouveautés du mois
- News (p. 30) • L’histoire des protos avec Benoît Couturier
- Compétition (p. 32) • La chronique d’Anthony Beltoise
- Courrier (p. 34) • La parole aux lecteurs
- Anniversaire (p. 38) • 100 ans de Ferry Porsche
- Voyage (p. 42) • La Chine en 997 Carrera 4S
- Match (p. 52) • 6 RS pour un anniversaire
- Comparatif (p. 60) • Derek Bell au volant de la 908 et de la 917
- Match (p. 70) • Gamballa Mirage GT vs 9ff Carrera GT-T900
- Histoire (p. 78) • 100 numéros de RS magazine
- Compétition (p. 92) • La Panamericana en 911
- Découverte (p. 96) • La 911 SC Motorsport
- Préparation (p. 102) • 997 Street Cup
- Classic (p. 108) • Une 356 extraterrestre
- Témoignage (p. 114) • 100 lecteurs pour 100 numéros
- Club Porsche (p. 122) • Meeting de Magny-Cours
- Les clubs (p. 128) • Tous les calendriers 2009
- Juridique (p. 130) • Le retrait de point des dirigeants d’entreprises
- Pilotage (p. 131) • Questions sur les pertes d’adhérence – (2ème partie)
- La cote RS Mag (p. 132) • Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 100
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Sommaire
- SALON • Epoqu’Auto fête les 50 ans de la 911
- NEWS • Toute l’actualité Porsche
- COURRIER • La parole aux lecteurs
- NOUVEAUTE • Les trois versions du Macan, de A à Z
- NOUVEAUTE • La Panamera Turbo S
- COMPETITION • La Carrera Cup au Castellet
- HISTOIRE • 1985 : la rétro de Porsche aux 24 Heures du Mans
- SHOPPING • 40 idées cadeau Porsche pour Noël
- ESSAI • Le test vérité du Cayman S engagé en Rallye
- GUIDE D’ACHAT “LES MEILLEURS RAPPORTS PRIX/PLAISIR” • DE 20 000 à 100 000 €, ces Porsche qui vous en offrent pour votre argent : 911 2.0 T – 911 Carrera 3.2 TL – 964 Turbo II 3.3 • 993 Carrera 4S – 996 GT3 phase I – 996 Turbo – 997 Carrera 4S cabriolet – 997 Carrera GTS – 991 Carrera cabriolet – Boxster S 260 ch – Cayman R
- ENTRETIEN • Franck Walliser, chef du développement de la 918 Spyder
- CENTRE PORSCHE • La Rochelle a la fibre écolo
- TEMOIGNAGE • La 964 Carrera cabriolet Tiptronic vu par un propriétaire
- CLASSIC • 356 A Speedster
- CLUB • Les calendriers 2013
- COTE • Chaque mois, la cote actualisée de toutes les Porsche d’occasion
- ANNONCES • 1000 Porsche d’occasion

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 150
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au programme de ce numéro de janvier 2009, vous pourrez savourer entre autres, le premier essai de la Cayman S Phase II, un match 997 GT2 vs Ruf Rturbo, une rencontre 964 Carrera, une personnalisation Cayman VRC, retour sur une légende, la 904 GTS, une préparation 996 San Diego Expresse Hamann etc.

Sommaire
- Nouveauté (p. 4) • Le Cayenne Diesel
- News (p. 8) • By RS magazine
- News (p. 12) • L’histoire des protos avec Benoît Couturier
- Miniatures (p. 14) • Les nouveautés du mois
- Courrier (p. 16) • La parole aux lecteurs
- Premier essai (p. 20) • Cayman S Phase II
- Match (p. 28) • 997 GT2 vs Ruf Rturbo
- Rencontre (p. 34) • 964 Carrera
- Guide pratique (p. 40) • 993 Carrera
- Personnalisation (p. 48) • Cayman VRC
- Légende (p. 54)
- 904 GTS
- Préparation (p. 60) • 996 San Diego Expresse Hamann
- Enquête lecteurs (p. 64) • 911 Carrera 3.2
- Classic (p. 72) • 356 Roadster
- La cote RS Mag (p. 80)

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 91
  AND coalesce(trim(description), '') = '';

UPDATE public.magazines SET description = $s$Au sommaire de ce numéro 68 de RS Mag, paru en février 2007, partez à la rencontre de la 997 Turbo Mission 400 PLus, un essai extrême du Cayenne Turbo S, un guide pratique sur la 964 Targa, un essai longue durée de la 993 Carrera ou encore une rencontre 944 S2 cab vs 944 Turbo cab...

Sommaire
- Record 4
- 997 Turbo Mission 400 Plus
- News 8
- By RS magazine
- Miniatures 10
- Les nouveaumois
- Courrier 12
- La parole aux lecteurs
- Essai extrême 24
- Cayenne Turbo S
- Guide pratique 30
- 964 Targa
- Rencontre 38
- 2.7 RS première main
- Essai longue durée 44
- 993 Carrera
- Moteurs avant 50
- 944 S2 cab vs 944 Turbo cab
- Préparation 56
- 996 Turbo 510 ch
- Technique 62
- Spoilers et ailerons 1972-1989
- Classic 66
- 356 cabriolet
- Pilotage 72
- Le circuit de Pouilly en Auxois
- Avocat 74
- La garantie pour vices cachés
- Les Clubs 76
- Les programmes 2007
- La cote RS Mag 78
- Remise à jour chaque mois

(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)$s$
WHERE title = 'RS Magazine' AND issue_number ~ '^[0-9]+$' AND issue_number::int = 68
  AND coalesce(trim(description), '') = '';
