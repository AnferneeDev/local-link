import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    FileModule,
    MulterModule.register({
      dest: './uploads',
    }),

    // --- THIS IS THE NEW PART ---
    // This serves the 'index.html' page
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      // This serves it from the root URL (e.g., localhost:3000/)
      serveRoot: '/',
    }),
    // --- END OF NEW PART ---

    // This is your old one for downloads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/file/',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
