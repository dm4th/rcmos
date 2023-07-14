-- Create Table to store claim information

CREATE TABLE "public"."claims" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."claims" OWNER TO "postgres";

ALTER TABLE ONLY "public"."claims"
    ADD CONSTRAINT "claims_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."claims"
    ADD CONSTRAINT "claims_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE "public"."claims" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable CRUD for authenticated users only" ON "public"."claims" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

GRANT ALL ON TABLE "public"."claims" TO "anon";
GRANT ALL ON TABLE "public"."claims" TO "authenticated";
GRANT ALL ON TABLE "public"."claims" TO "service_role";

-- Change records table to include id of the claim used to create the page summaries

ALTER TABLE "public"."medical_records" ADD COLUMN "claim_id" "uuid";

ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_claim_fkey" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id");

-- Create PDF storage bucket for denial letters
INSERT INTO storage.buckets (id, name)
VALUES ('letters', 'Denial Letters');

CREATE POLICY "Anon to Read Denial Letters"
ON storage.objects for SELECT
TO anon
USING ( bucket_id = 'letters' );

CREATE POLICY "Anon to Write Denial Letters"
ON storage.objects for INSERT
TO anon
WITH CHECK ( bucket_id = 'letters' );

-- Create table to store denial letter information

CREATE TABLE "public"."denial_letters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "claim_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "summary" "text",
    "content_processing_progress" "int4" NOT NULL,
    "content_processing_type" "text" NOT NULL,
    "content_processing_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."denial_letters" OWNER TO "postgres";

ALTER TABLE ONLY "public"."denial_letters"
    ADD CONSTRAINT "denial_letters_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."denial_letters"
    ADD CONSTRAINT "claims_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE "public"."denial_letters" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for service-role only" 
ON "public"."denial_letters" 
TO "service_role" 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable read access for anon" 
ON "public"."denial_letters"
AS PERMISSIVE FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable insert access for anon" 
ON "public"."denial_letters"
AS PERMISSIVE FOR INSERT
TO anon
WITH CHECK (true);

-- Create view to get a combination of medical_record and denial_letter information in one query

CREATE VIEW "public"."claim_documents" AS 
    SELECT
        'medical_record' AS "type",
        claim_id,
        id AS document_id,
        file_name,
        file_url,
        content_embedding_progress AS content_processing_progress,
        NULL AS summary,
        created_at
    FROM "public"."medical_records"
    UNION ALL
    SELECT
        'denial_letter' AS "type",
        claim_id,
        id AS document_id,
        file_name,
        file_url,
        content_processing_progress,
        summary,
        created_at
    FROM "public"."denial_letters";


