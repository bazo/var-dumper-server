import * as z from "zod";

export const SourceSchema = z.object({
	name: z.string(),
	file: z.string(),
	line: z.number(),
	file_excerpt: z.boolean(),
	project_dir: z.string().optional(),
	file_relative: z.string().optional(),
	file_link: z.string().optional(),
});
export type Source = z.infer<typeof SourceSchema>;

export const RequestSchema = z.object({
	uri: z.string(),
	method: z.string(),
	controller: z.string(),
	identifier: z.string(),
});
export type Request = z.infer<typeof RequestSchema>;

export const CliSchema = z.object({
	command_line: z.string(),
	identifier: z.string(),
});
export type Cli = z.infer<typeof CliSchema>;

export const DumpContextSchema = z.object({
	timestamp: z.number(),
	cli: CliSchema.optional(),
	source: SourceSchema,
	request: RequestSchema.optional(),
});
export type DumpContext = z.infer<typeof DumpContextSchema>;

export const DumpSchema = z.object({
	id: z.number(),
	context: z.string().transform((json) => {
		return DumpContextSchema.parse(JSON.parse(json));
	}),
	html: z.string(),
	created_at: z.string().transform((dateString) => {
		return new Date(dateString);
	}),
});
export type Dump = z.infer<typeof DumpSchema>;

export const DumpDataSchema = z.object({
	dumps: z.array(DumpSchema),
	total: z.number(),
	pages: z.number(),
});
export type DumpData = z.infer<typeof DumpDataSchema>;
