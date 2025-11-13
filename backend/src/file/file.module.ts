import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileGateway } from './file.gateway'; // <-- IMPORT THIS

@Module({
  controllers: [FileController],
  // --- ADD FileGateway HERE ---
  providers: [FileService, FileGateway],
})
export class FileModule {}
