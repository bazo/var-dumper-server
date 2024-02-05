<?php

use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\VarDumper\Cloner\Data;
use Symfony\Component\VarDumper\Command\Descriptor\CliDescriptor;
use Symfony\Component\VarDumper\Command\Descriptor\HtmlDescriptor;
use Symfony\Component\VarDumper\Dumper\CliDumper;
use Symfony\Component\VarDumper\Dumper\HtmlDumper;
use Symfony\Component\VarDumper\Server\DumpServer;

function exception_error_handler(int $errno, string $errstr, string $errfile = null, int $errline)
{
	if (!(error_reporting() & $errno)) {
		// This error code is not included in error_reporting
		return;
	}
	throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
}
set_error_handler(exception_error_handler(...));

require_once __DIR__ . '/vendor/autoload.php';

$server = new DumpServer("0.0.0.0:9912");

$cliDescriptor = new CliDescriptor(new CliDumper());
$htmlDescriptor = new HtmlDescriptor(new HtmlDumper());

$input = new ArrayInput([]);
$output = new ConsoleOutput();
$io = new SymfonyStyle($input, $output);

$bufferedOutput = new BufferedOutput();

$errorIo = $io->getErrorStyle();
$errorIo->title('Symfony Var Dumper Server');

$server->start();

$errorIo->success(sprintf('Server listening on %s', $server->getHost()));
$errorIo->comment('Quit the server with CONTROL-C.');

const DB_NAME = "db/dumps.sqlite";

$sqlite = new SQLite3(DB_NAME);

$sqlite->exec("
CREATE TABLE IF NOT EXISTS dumps (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    html       TEXT,
	context TEXT,
    created_at DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
);
");

$opts = [
	'http' =>
		[
			'method' => 'POST',
		]
];

$streamContext = stream_context_create($opts);

$server->listen(function (Data $data, array $context, int $clientId) use ($cliDescriptor, $htmlDescriptor, $io, $bufferedOutput, $sqlite, $streamContext) {
	$cliDescriptor->describe($io, $data, $context, $clientId);
	$htmlDescriptor->describe($bufferedOutput, $data, $context, $clientId);

	$html = $bufferedOutput->fetch();
	$base64 = base64_encode($html);

	if (isset($context["request"])) {
		$context["request"]["controller"] = $context["request"]['controller']->getValue();
	}
	$json = json_encode($context);

	$sqlite->exec("INSERT INTO dumps ('html', 'context') VALUES('$base64', '$json')");
	$id = $sqlite->lastInsertRowID();

	try {
		$result = file_get_contents("http://127.0.0.1:9876/publish?id=$id", false, $streamContext);
		if ($result === "ok") {
			$io->info("Dump $id published to websocket");
		}
	} catch (\ErrorException $e) {
		$io->error($e->getMessage());
	}
});


