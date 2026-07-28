import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { Role } from 'src/common/decorators/role.decorator';
import { roleEnum } from 'src/common/enums/role.enum';
import { AdminPodcastQueryDto } from './dto/admin-podcast-query.dto';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { UpdatePodcastDto } from './dto/update-podcast.dto';
import { PodcastService } from './podcast.service';

@Controller('admin/podcasts')
@Role([roleEnum.ADMIN, roleEnum.OWNER])
export class AdminPodcastController {
    constructor(private readonly podcastService: PodcastService) {}

    @Get()
    findAll(@Query() query: AdminPodcastQueryDto) {
        return this.podcastService.findAllForAdmin(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.podcastService.findOneForAdmin(id);
    }

    @Post()
    create(@Body() dto: CreatePodcastDto) {
        return this.podcastService.create(dto);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePodcastDto,
    ) {
        return this.podcastService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.podcastService.remove(id);
    }
}
