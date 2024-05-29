--
-- PostgreSQL database dump
--

-- Dumped from database version 14.11 (Homebrew)
-- Dumped by pg_dump version 14.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.languages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(5)
);


ALTER TABLE public.languages OWNER TO postgres;

--
-- Name: languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.languages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.languages_id_seq OWNER TO postgres;

--
-- Name: languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.languages_id_seq OWNED BY public.languages.id;


--
-- Name: translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations (
    id integer NOT NULL,
    word_id integer NOT NULL,
    language_id integer NOT NULL,
    translation character varying(255) NOT NULL
);


ALTER TABLE public.translations OWNER TO postgres;

--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.translations_id_seq OWNER TO postgres;

--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;


--
-- Name: words; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.words (
    id integer NOT NULL,
    word character varying(255) NOT NULL
);


ALTER TABLE public.words OWNER TO postgres;

--
-- Name: words_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.words_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.words_id_seq OWNER TO postgres;

--
-- Name: words_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.words_id_seq OWNED BY public.words.id;


--
-- Name: languages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages ALTER COLUMN id SET DEFAULT nextval('public.languages_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: words id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.words ALTER COLUMN id SET DEFAULT nextval('public.words_id_seq'::regclass);


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.languages (id, name, code) FROM stdin;
1	Spanish	es
2	Italian	it
3	Portuguese	pt
4	German	de
5	French	fr
\.


--
-- Data for Name: translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.translations (id, word_id, language_id, translation) FROM stdin;
22	5	2	Arancia
23	5	3	Laranja
24	5	4	Orange
25	5	5	Orange
26	6	1	Pera
27	6	5	Poire
28	7	5	Myrtille
29	7	1	Arándano
30	7	3	Mirtilo
31	7	2	Mirtillo
32	7	4	Blaubeere
34	6	3	Pereria
109	62	5	Citron
110	62	4	Zitrone
111	63	1	Mango
112	63	2	Mango
113	63	3	Manga
114	63	5	Mangue
115	63	4	Mango
116	64	1	Guisante
117	64	2	Pisello
118	64	3	Ervilha
119	64	5	Pois
120	64	4	Erbse
21	5	1	Naranja
11	3	1	Piña
35	6	2	Pera
36	9	1	Guayaba
12	3	2	Ananas
39	11	3	Pêssego
38	11	1	Durazno
13	3	3	Ananás
41	9	2	Goiaba
40	12	1	Toronja
47	11	2	Pesca
48	12	2	Pompelmo
49	6	4	Birne
50	9	4	Guave
52	11	4	Pfirsich
53	12	4	Pampelmuse
54	9	5	Goyave
56	11	5	Pêche
57	12	5	Pamplemousse
58	9	3	Goiaba
60	12	3	Toranja
6	2	1	Manzana
7	2	2	Mela
8	2	3	Maçã
10	2	5	Pomme
9	2	4	Apfel
37	10	1	Aguacate
46	10	2	Avocado
59	10	3	Abacate
55	10	5	Avocat
51	10	4	Avocado
1	1	1	Plátano
2	1	2	Banana
3	1	3	Banana
5	1	5	Banane
4	1	4	Banane
61	53	1	Brócoli
62	53	2	Broccolo
63	53	3	Brócolis
64	53	5	Brocolis
65	53	4	Brokkoli
66	54	1	Zanahoria
67	54	2	Carota
68	54	3	Cenoura
69	54	5	Carotte
70	54	4	Karotte
71	55	1	Cereza
72	55	2	Ciliegia
73	55	3	Cereja
74	55	5	Cerise
75	55	4	Kirsche
76	56	1	Chile
77	56	2	Peperoncino
78	56	3	Pimenta
79	56	5	Piment
80	56	4	Chili
81	57	1	Maíz
82	57	2	Mais
83	57	3	Milho
84	57	5	Maïs
85	57	4	Mais
86	58	1	Pepino
87	58	2	Cetriolo
88	58	3	Pepino
89	58	5	Concombre
90	58	4	Gurke
91	59	1	Berenjena
92	59	2	Melanzana
93	59	3	Berinjela
94	59	5	Aubergine
95	59	4	Aubergine
96	60	1	Uva
97	60	2	Uva
98	60	3	Uva
99	60	5	Raisin
100	60	4	Traube
101	61	1	Kiwi
102	61	2	Kiwi
103	61	3	Kiwi
104	61	5	Kiwi
105	61	4	Kiwi
106	62	1	Limón
107	62	2	Limone
108	62	3	Limão
15	3	5	Ananas
14	3	4	Ananas
121	65	1	Calabaza
122	65	2	Zucca
123	65	3	Abóbora
124	65	5	Potiron
125	65	4	Kürbis
16	4	1	Fresa
17	4	2	Fragola
18	4	3	Morango
20	4	5	Fraise
19	4	4	Erdbeere
33	8	1	Tomate
43	8	2	Pomodoro
45	8	3	Tomate
44	8	5	Tomate
42	8	4	Tomate
126	66	1	Sandía
127	66	2	Cocomero
128	66	3	Melancia
129	66	5	Pastèque
130	66	4	Wassermelone
\.


--
-- Data for Name: words; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.words (id, word) FROM stdin;
1	Banana
2	Apple
3	Pineapple
4	Strawberry
5	Orange
6	Pear
7	Blueberry
8	Tomato
9	Guava
10	Avocado
11	Peach
12	Grapefruit
53	Brocolli
54	Carrot
55	Cherry
56	Chili
57	Corn
58	Cucumber
59	Eggplant
60	Grape
61	Kiwi
62	Lemon
63	Mango
64	Pea
65	Pumpkin
66	Watermelon
\.


--
-- Name: languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.languages_id_seq', 5, true);


--
-- Name: translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.translations_id_seq', 130, true);


--
-- Name: words_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.words_id_seq', 66, true);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: words words_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.words
    ADD CONSTRAINT words_pkey PRIMARY KEY (id);


--
-- Name: translations translations_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id);


--
-- Name: translations translations_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id);


--
-- PostgreSQL database dump complete
--

