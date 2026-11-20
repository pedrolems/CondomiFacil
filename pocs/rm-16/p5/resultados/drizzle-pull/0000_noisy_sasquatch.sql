-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "app";
--> statement-breakpoint
CREATE TABLE "app"."condominio" (
	"id" uuid NOT NULL,
	"nome" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."condominio" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."unidade" (
	"id" uuid NOT NULL,
	"condominio_id" uuid NOT NULL,
	"bloco" text NOT NULL,
	"numero" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."unidade" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."area" (
	"id" uuid NOT NULL,
	"condominio_id" uuid NOT NULL,
	"nome" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."area" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."reserva" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"condominio_id" uuid NOT NULL,
	"area_id" uuid NOT NULL,
	"unidade_id" uuid NOT NULL,
	"periodo" "tstzrange" NOT NULL,
	"estado" text DEFAULT 'confirmada' NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reserva_periodo_check" CHECK ((NOT isempty(periodo)) AND lower_inc(periodo) AND (NOT upper_inc(periodo))),
	CONSTRAINT "reserva_estado_check" CHECK (estado = ANY (ARRAY['confirmada'::text, 'cancelada'::text]))
);
--> statement-breakpoint
ALTER TABLE "app"."reserva" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."reserva_auditoria" (
	"id" bigint GENERATED ALWAYS AS IDENTITY (sequence name "app"."app.reserva_auditoria_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"condominio_id" uuid NOT NULL,
	"reserva_id" uuid NOT NULL,
	"acao" text NOT NULL,
	"estado_antes" text,
	"estado_depois" text,
	"em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reserva_auditoria_acao_check" CHECK (acao = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))
);
--> statement-breakpoint
ALTER TABLE "app"."reserva_auditoria" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."unidade" ADD CONSTRAINT "unidade_condominio_id_fkey" FOREIGN KEY ("condominio_id") REFERENCES "app"."condominio"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."area" ADD CONSTRAINT "area_condominio_id_fkey" FOREIGN KEY ("condominio_id") REFERENCES "app"."condominio"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."reserva" ADD CONSTRAINT "reserva_condominio_id_area_id_fkey" FOREIGN KEY ("condominio_id","area_id") REFERENCES "app"."area"("id","condominio_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."reserva" ADD CONSTRAINT "reserva_condominio_id_unidade_id_fkey" FOREIGN KEY ("condominio_id","unidade_id") REFERENCES "app"."unidade"("id","condominio_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."reserva_auditoria" ADD CONSTRAINT "reserva_auditoria_condominio_id_fkey" FOREIGN KEY ("condominio_id") REFERENCES "app"."condominio"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reserva_por_unidade" ON "app"."reserva" USING btree ("condominio_id" uuid_ops,"unidade_id" range_ops,"periodo" range_ops);--> statement-breakpoint
CREATE POLICY "tenant" ON "app"."condominio" AS PERMISSIVE FOR ALL TO "app_user" USING ((id = app.condominio_atual())) WITH CHECK ((id = app.condominio_atual()));--> statement-breakpoint
CREATE POLICY "tenant" ON "app"."unidade" AS PERMISSIVE FOR ALL TO "app_user" USING ((condominio_id = app.condominio_atual())) WITH CHECK ((condominio_id = app.condominio_atual()));--> statement-breakpoint
CREATE POLICY "tenant" ON "app"."area" AS PERMISSIVE FOR ALL TO "app_user" USING ((condominio_id = app.condominio_atual())) WITH CHECK ((condominio_id = app.condominio_atual()));--> statement-breakpoint
CREATE POLICY "tenant" ON "app"."reserva" AS PERMISSIVE FOR ALL TO "app_user" USING ((condominio_id = app.condominio_atual())) WITH CHECK ((condominio_id = app.condominio_atual()));--> statement-breakpoint
CREATE POLICY "tenant_inserir" ON "app"."reserva_auditoria" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ((condominio_id = app.condominio_atual()));--> statement-breakpoint
CREATE POLICY "tenant_ler" ON "app"."reserva_auditoria" AS PERMISSIVE FOR SELECT TO "app_user";
*/