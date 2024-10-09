import { systemLog } from '@/utils/common';
import prisma from '@/utils/database/sqlite';

/**
 * test prisma for sqlite db
 * @returns mock data
 */
export async function sqliteTest(): Promise<APIRet> {
    const recipes = await prisma.recipe.findMany();

    recipes.forEach((item: any) => {
        item['ingredients'] = JSON.parse(item.ingredients);
    });

    systemLog(0, recipes.length);

    return { code: 0, data: recipes, message: 'list recipes success' };
}
