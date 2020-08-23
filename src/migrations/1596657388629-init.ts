import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1596657388629 implements MigrationInterface {
  name = 'init1596657388629';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sample_table" ("id" SERIAL NOT NULL, "sample" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a12b77fc6a2df5c801053815445" UNIQUE ("sample"), CONSTRAINT "PK_229b63bbdc68dbdcdefee4405c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a12b77fc6a2df5c80105381544" ON "sample_table" ("sample") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_a12b77fc6a2df5c80105381544"`);
    await queryRunner.query(`DROP TABLE "sample_table"`);
  }
}
