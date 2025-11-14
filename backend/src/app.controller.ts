import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { networkInterfaces } from 'os'; // Import 'os' module

// This helper function finds your computer's local IP address
function getLocalIP(): string | null {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      // Skip over non-IPv4 and internal (e.g., 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // This is the new endpoint your app will call
  @Get('ip')
  getIP() {
    const ip = getLocalIP();
    return { ip: ip || 'Not Found' };
  }
}
