import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('sample_table')
export class SampleEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'sample',
    type: String,
  })
  @Index()
  @Column({ nullable: false, unique: true })
  sample: string;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;
}
