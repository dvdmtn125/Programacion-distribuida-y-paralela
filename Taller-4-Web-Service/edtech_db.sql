--
-- PostgreSQL database dump
--

\restrict nVNU7mNll5nd3TDnvS6jDTE4fQTL0dpZs6Vj2Z0oQXy4lPRwHE2FjoaDmjRXX1l

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

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
-- Name: cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos (
    id integer NOT NULL,
    nombre character varying(120) NOT NULL,
    descripcion character varying(255) NOT NULL,
    cupo integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cursos OWNER TO postgres;

--
-- Name: cursos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cursos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cursos_id_seq OWNER TO postgres;

--
-- Name: cursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cursos_id_seq OWNED BY public.cursos.id;


--
-- Name: inscripciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inscripciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    curso_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inscripciones OWNER TO postgres;

--
-- Name: inscripciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inscripciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inscripciones_id_seq OWNER TO postgres;

--
-- Name: inscripciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inscripciones_id_seq OWNED BY public.inscripciones.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(120) NOT NULL,
    correo character varying(120) NOT NULL,
    carrera character varying(120) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: cursos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos ALTER COLUMN id SET DEFAULT nextval('public.cursos_id_seq'::regclass);


--
-- Name: inscripciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones ALTER COLUMN id SET DEFAULT nextval('public.inscripciones_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cursos (id, nombre, descripcion, cupo, created_at) FROM stdin;
1	Python	Curso basico de python	30	2026-04-19 21:14:40.047259+00
3	Html	curso de html5	25	2026-04-19 21:31:14.29887+00
4	C++	Curso de C++	20	2026-04-25 18:24:19.946618+00
5	Visual Basic	Curso de Visual Basic	1	2026-04-25 18:29:39.018854+00
6	Php	Curso de Php	30	2026-05-03 20:12:11.90288+00
\.


--
-- Data for Name: inscripciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscripciones (id, usuario_id, curso_id, created_at) FROM stdin;
1	1	1	2026-04-19 21:15:04.279145+00
3	3	1	2026-04-19 21:31:50.048558+00
4	3	3	2026-04-19 21:31:54.481968+00
5	1	4	2026-04-25 18:27:30.865071+00
6	3	5	2026-04-25 18:29:48.37831+00
7	1	3	2026-04-26 18:35:54.999579+00
8	4	6	2026-05-03 20:12:37.816632+00
41	4	1	2026-05-03 20:52:17.882105+00
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, correo, carrera, created_at) FROM stdin;
1	david	sljd@dlnal.com	ing	2026-04-19 21:14:58.465624+00
3	frank	dfj@mdnf.com	inf	2026-04-19 21:31:44.373309+00
4	Luis	luis@email.com	ing	2026-05-03 20:12:30.676774+00
\.


--
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursos_id_seq', 6, true);


--
-- Name: inscripciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inscripciones_id_seq', 41, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 4, true);


--
-- Name: cursos cursos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_nombre_key UNIQUE (nombre);


--
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- Name: inscripciones inscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ix_cursos_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cursos_id ON public.cursos USING btree (id);


--
-- Name: ix_inscripciones_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_inscripciones_id ON public.inscripciones USING btree (id);


--
-- Name: ix_usuarios_correo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_usuarios_correo ON public.usuarios USING btree (correo);


--
-- Name: ix_usuarios_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_usuarios_id ON public.usuarios USING btree (id);


--
-- Name: inscripciones inscripciones_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: inscripciones inscripciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict nVNU7mNll5nd3TDnvS6jDTE4fQTL0dpZs6Vj2Z0oQXy4lPRwHE2FjoaDmjRXX1l

