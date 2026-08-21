import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('occasions')
export class Occasion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true })
  slug!: string; // romantico, marmita, kids...

  @Column({ type: 'varchar' })
  titulo!: string;

  @Column({ type: 'text' })
  descricao!: string;
}
