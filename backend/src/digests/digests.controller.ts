import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DigestsService } from './digests.service';

@Controller('digests')
@UseGuards(JwtAuthGuard)
export class DigestsController {
  constructor(private digestsService: DigestsService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    return this.digestsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.digestsService.findOne(id, req.user.id);
  }
}
